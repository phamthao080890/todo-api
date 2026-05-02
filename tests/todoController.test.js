'use strict';

// Mock models before importing the controller
jest.mock('../src/models', () => ({
  Todo: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

const { Todo } = require('../src/models');
const { getAll, getOne, create, update, remove } = require('../src/controllers/todoController');
const { HTTP, MSG } = require('../src/constants/messages');

// Suppress console.error noise in test output
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => console.error.mockRestore());

function buildRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
}

describe('todoController', () => {
  afterEach(() => jest.clearAllMocks());

  // ── getAll ────────────────────────────────────────────────────────────────

  describe('getAll', () => {
    it('returns 200 with todos array', async () => {
      const todos = [{ id: 1, title: 'Test' }];
      Todo.findAll.mockResolvedValue(todos);

      const req = { user: { id: 1 } };
      const res = buildRes();
      await getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
      expect(res.json).toHaveBeenCalledWith({ todos });
    });

    it('returns 500 on DB error', async () => {
      Todo.findAll.mockRejectedValue(new Error('DB error'));

      const req = { user: { id: 1 } };
      const res = buildRes();
      await getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_ERROR);
      expect(res.json).toHaveBeenCalledWith({ message: MSG.INTERNAL_ERROR });
    });
  });

  // ── getOne ────────────────────────────────────────────────────────────────

  describe('getOne', () => {
    it('returns 200 with the todo', async () => {
      const todo = { id: 1, title: 'Test' };
      Todo.findOne.mockResolvedValue(todo);

      const req = { user: { id: 1 }, params: { id: '1' } };
      const res = buildRes();
      await getOne(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
      expect(res.json).toHaveBeenCalledWith({ todo });
    });

    it('returns 404 when todo is not found', async () => {
      Todo.findOne.mockResolvedValue(null);

      const req = { user: { id: 1 }, params: { id: '999' } };
      const res = buildRes();
      await getOne(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP.NOT_FOUND);
      expect(res.json).toHaveBeenCalledWith({ message: MSG.TODO_NOT_FOUND });
    });

    it('returns 500 on DB error', async () => {
      Todo.findOne.mockRejectedValue(new Error('DB error'));

      const req = { user: { id: 1 }, params: { id: '1' } };
      const res = buildRes();
      await getOne(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_ERROR);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('returns 201 with created todo', async () => {
      const todo = { id: 1, title: 'Buy milk', description: 'full fat', userId: 1 };
      Todo.create.mockResolvedValue(todo);

      const req = { user: { id: 1 }, body: { title: 'Buy milk', description: 'full fat' } };
      const res = buildRes();
      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP.CREATED);
      expect(res.json).toHaveBeenCalledWith({ todo });
    });

    it('returns 500 on DB error', async () => {
      Todo.create.mockRejectedValue(new Error('DB error'));

      const req = { user: { id: 1 }, body: { title: 'Test' } };
      const res = buildRes();
      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_ERROR);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('returns 200 with all fields updated when all are provided', async () => {
      const mockTodo = {
        id: 1, title: 'old', description: 'old desc', completed: false,
        update: jest.fn().mockResolvedValue(undefined),
      };
      Todo.findOne.mockResolvedValue(mockTodo);

      const req = {
        user: { id: 1 }, params: { id: '1' },
        body: { title: 'New title', description: 'New desc', completed: true },
      };
      const res = buildRes();
      await update(req, res);

      expect(mockTodo.update).toHaveBeenCalledWith({
        title: 'New title',
        description: 'New desc',
        completed: true,
      });
      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
    });

    it('keeps existing values when no fields are provided in body', async () => {
      const mockTodo = {
        id: 1, title: 'existing', description: 'existing desc', completed: false,
        update: jest.fn().mockResolvedValue(undefined),
      };
      Todo.findOne.mockResolvedValue(mockTodo);

      const req = { user: { id: 1 }, params: { id: '1' }, body: {} };
      const res = buildRes();
      await update(req, res);

      expect(mockTodo.update).toHaveBeenCalledWith({
        title: 'existing',
        description: 'existing desc',
        completed: false,
      });
      expect(res.status).toHaveBeenCalledWith(HTTP.OK);
    });

    it('returns 404 when todo is not found', async () => {
      Todo.findOne.mockResolvedValue(null);

      const req = { user: { id: 1 }, params: { id: '999' }, body: { title: 'x' } };
      const res = buildRes();
      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP.NOT_FOUND);
    });

    it('returns 500 on DB error', async () => {
      Todo.findOne.mockRejectedValue(new Error('DB error'));

      const req = { user: { id: 1 }, params: { id: '1' }, body: {} };
      const res = buildRes();
      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_ERROR);
    });
  });

  // ── remove ────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('returns 204 and calls destroy on success', async () => {
      const mockTodo = { destroy: jest.fn().mockResolvedValue(undefined) };
      Todo.findOne.mockResolvedValue(mockTodo);

      const req = { user: { id: 1 }, params: { id: '1' } };
      const res = buildRes();
      await remove(req, res);

      expect(mockTodo.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HTTP.NO_CONTENT);
      expect(res.send).toHaveBeenCalled();
    });

    it('returns 404 when todo is not found', async () => {
      Todo.findOne.mockResolvedValue(null);

      const req = { user: { id: 1 }, params: { id: '999' } };
      const res = buildRes();
      await remove(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP.NOT_FOUND);
    });

    it('returns 500 on DB error', async () => {
      Todo.findOne.mockRejectedValue(new Error('DB error'));

      const req = { user: { id: 1 }, params: { id: '1' } };
      const res = buildRes();
      await remove(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP.INTERNAL_ERROR);
    });
  });
});
