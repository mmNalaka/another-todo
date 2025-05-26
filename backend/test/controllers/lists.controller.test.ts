import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as listsController from '../../src/controllers/lists.controller'
import * as listsRepo from '../../src/db/repositories/lists.repo'
import * as responseUtils from '../../src/utils/response.utils'
import * as errorUtils from '../../src/utils/error.utils'
import * as idUtils from '../../src/utils/id'

// Mock the repositories and utilities
vi.mock('../../src/db/repositories/lists.repo')
vi.mock('../../src/utils/response.utils')
vi.mock('../../src/utils/error.utils')
vi.mock('../../src/utils/id')

describe('Lists Controller', () => {
  // Mock context for all tests
  let mockContext: any
  
  // Sample user for authentication
  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
  }
  
  // Sample list data with schema property to match the type
  const mockList = {
    id: 'list123',
    title: 'Test List',
    description: 'Test Description',
    color: '#FF5733',
    ownerId: 'user123',
    isShared: false,
    isFrozen: false,
    schema: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  // Sample tasks with all required properties
  const mockTasks = [
    { 
      id: 'task1', 
      title: 'Task 1', 
      listId: 'list123',
      value: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user123',
      parentTaskId: null,
      priority: null,
      isCompleted: false,
      dueDate: null,
      position: 0
    },
    { 
      id: 'task2', 
      title: 'Task 2', 
      listId: 'list123',
      value: null,
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'user123',
      parentTaskId: null,
      priority: null,
      isCompleted: false,
      dueDate: null,
      position: 1
    },
  ]
  
  // Sample collaborators
  const mockCollaborators = [
    { userId: 'collab1', listId: 'list123', role: 'viewer', name: 'Collaborator 1', email: 'collab1@example.com' },
  ]
  
  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks()
    
    // Setup mock context
    mockContext = {
      get: vi.fn((key) => {
        if (key === 'user') return mockUser
        return undefined
      }),
      req: {
        valid: vi.fn((type) => {
          if (type === 'param') return { id: 'list123' }
          if (type === 'json') return { title: 'Updated List', description: 'Updated Description' }
          if (type === 'query') return { page: 1, limit: 10 }
          return {}
        }),
      },
    }
    
    // Setup response utils mocks
    vi.mocked(responseUtils.createSuccessResponse).mockReturnValue('success-response' as any)
    vi.mocked(responseUtils.createPaginatedResponse).mockReturnValue('paginated-response' as any)
    vi.mocked(responseUtils.calculatePagination).mockReturnValue({ page: 1, limit: 10, total: 2, pages: 1 })
    
    // Setup error utils mocks
    vi.mocked(errorUtils.createErrorResponse).mockReturnValue('error-response' as any)
    
    // Setup id utils mocks
    vi.mocked(idUtils.generateListId).mockReturnValue('new-list-id')
  })

  describe('getAllListHandler', () => {
    it('should return all personal lists for a user', async () => {
      // Setup mock repository response
      vi.mocked(listsRepo.getAllPersonalLists).mockResolvedValue([mockList])
      
      // Extract the handler function from the factory result
      // In Hono factory pattern, the handler is the last function in the array
      const handlerFn = listsController.getAllListHandler[listsController.getAllListHandler.length - 1] as Function
      
      // Call the handler
      const response = await handlerFn(mockContext)
      
      // Verify repository was called with correct arguments
      expect(listsRepo.getAllPersonalLists).toHaveBeenCalledWith('user123')
      
      // Verify response was created correctly
      expect(responseUtils.createPaginatedResponse).toHaveBeenCalledWith(
        mockContext,
        [mockList],
        { page: 1, limit: 10, pages: 1, total: 2 }
      )
      
      // Verify the response
      expect(response).toBe('paginated-response')
    })
    
    it('should return error when repository fails', async () => {
      // Setup mock repository response
      vi.mocked(listsRepo.getAllPersonalLists).mockResolvedValue(null as any)
      
      // Extract the handler function
      const handlerFn = listsController.getAllListHandler[listsController.getAllListHandler.length - 1] as Function
      
      // Call the handler
      const response = await handlerFn(mockContext)
      
      // Verify error response was created
      expect(errorUtils.createErrorResponse).toHaveBeenCalledWith(
        mockContext,
        'INTERNAL_SERVER_ERROR'
      )
      
      // Verify the response
      expect(response).toBe('error-response')
    })
  })
  
  describe('createListHandler', () => {
    it('should create a new list', async () => {
      // Setup mock repository response
      vi.mocked(listsRepo.createPersonalList).mockResolvedValue([mockList] as any)
      
      // Setup request data
      mockContext.req.valid = vi.fn((type) => {
        if (type === 'json') return { title: 'New List', description: 'New Description' }
        return {}
      })
      
      // Extract the handler function
      const handlerFn = listsController.createListHandler[listsController.createListHandler.length - 1] as Function
      
      // Call the handler
      const response = await handlerFn(mockContext)
      
      // Verify repository was called with correct arguments
      expect(listsRepo.createPersonalList).toHaveBeenCalledWith({
        title: 'New List',
        description: 'New Description',
        ownerId: 'user123',
        id: 'new-list-id',
      })
      
      // Verify success response was created
      expect(responseUtils.createSuccessResponse).toHaveBeenCalledWith(
        mockContext,
        [mockList]
      )
      
      // Verify the response
      expect(response).toBe('success-response')
    })
    
    it('should return error when repository fails', async () => {
      // Setup mock repository response
      vi.mocked(listsRepo.createPersonalList).mockResolvedValue(null as any)
      
      // Extract the handler function
      const handlerFn = listsController.createListHandler[listsController.createListHandler.length - 1] as Function
      
      // Call the handler
      const response = await handlerFn(mockContext)
      
      // Verify error response was created
      expect(errorUtils.createErrorResponse).toHaveBeenCalledWith(
        mockContext,
        'INTERNAL_SERVER_ERROR'
      )
      
      // Verify the response
      expect(response).toBe('error-response')
    })
  })
  
  describe('getListByIdHandler', () => {
    it('should return a list by id when user is owner', async () => {
      // Setup mock repository responses
      vi.mocked(listsRepo.getListById).mockResolvedValue(mockList as any)
      vi.mocked(listsRepo.getListCollaborators).mockResolvedValue(mockCollaborators)
      vi.mocked(listsRepo.getListTasks).mockResolvedValue(mockTasks)
      
      // Extract the handler function
      const handlerFn = listsController.getListByIdHandler[listsController.getListByIdHandler.length - 1] as Function
      
      // Call the handler
      const response = await handlerFn(mockContext)
      
      // Verify repositories were called with correct arguments
      expect(listsRepo.getListById).toHaveBeenCalledWith('list123')
      expect(listsRepo.getListCollaborators).toHaveBeenCalledWith('list123')
      expect(listsRepo.getListTasks).toHaveBeenCalledWith('list123')
      
      // Verify success response was created with combined data
      expect(responseUtils.createSuccessResponse).toHaveBeenCalledWith(
        mockContext,
        {
          ...mockList,
          tasks: mockTasks,
          collaborators: mockCollaborators,
        }
      )
      
      // Verify the response
      expect(response).toBe('success-response')
    })
    
    it('should return not found error when list does not exist', async () => {
      // Setup mock repository response
      vi.mocked(listsRepo.getListById).mockResolvedValue(null as any)
      
      // Extract the handler function
      const handlerFn = listsController.getListByIdHandler[listsController.getListByIdHandler.length - 1] as Function
      
      // Call the handler
      const response = await handlerFn(mockContext)
      
      // Verify error response was created
      expect(errorUtils.createErrorResponse).toHaveBeenCalledWith(
        mockContext,
        'NOT_FOUND'
      )
      
      // Verify the response
      expect(response).toBe('error-response')
    })
  })
  
  describe('updateListHandler', () => {
    it('should update a list when user is owner', async () => {
      // Setup mock repository responses
      vi.mocked(listsRepo.getListById).mockResolvedValue(mockList as any)
      vi.mocked(listsRepo.updateList).mockResolvedValue({
        ...mockList,
        title: 'Updated List',
        description: 'Updated Description',
      } as any)
      
      // Extract the handler function
      const handlerFn = listsController.updateListHandler[listsController.updateListHandler.length - 1] as Function
      
      // Call the handler
      const response = await handlerFn(mockContext)
      
      // Verify repositories were called with correct arguments
      expect(listsRepo.getListById).toHaveBeenCalledWith('list123')
      expect(listsRepo.updateList).toHaveBeenCalledWith('list123', {
        title: 'Updated List',
        description: 'Updated Description',
      })
      
      // Verify success response was created
      expect(responseUtils.createSuccessResponse).toHaveBeenCalled()
      
      // Verify the response
      expect(response).toBe('success-response')
    })
    
    it('should return not found error when list does not exist', async () => {
      // Setup mock repository response
      vi.mocked(listsRepo.getListById).mockResolvedValue(null as any)
      
      // Extract the handler function
      const handlerFn = listsController.updateListHandler[listsController.updateListHandler.length - 1] as Function
      
      // Call the handler
      const response = await handlerFn(mockContext)
      
      // Verify error response was created
      expect(errorUtils.createErrorResponse).toHaveBeenCalledWith(
        mockContext,
        'NOT_FOUND'
      )
      
      // Verify the response
      expect(response).toBe('error-response')
    })
  })
  
  describe('deleteListHandler', () => {
    it('should delete a list when user is owner', async () => {
      // Setup mock repository responses
      vi.mocked(listsRepo.getListById).mockResolvedValue(mockList as any)
      vi.mocked(listsRepo.deleteList).mockResolvedValue(mockList as any)
      
      // Extract the handler function
      const handlerFn = listsController.deleteListHandler[listsController.deleteListHandler.length - 1] as Function
      
      // Call the handler
      const response = await handlerFn(mockContext)
      
      // Verify repositories were called with correct arguments
      expect(listsRepo.getListById).toHaveBeenCalledWith('list123')
      expect(listsRepo.deleteList).toHaveBeenCalledWith('list123')
      
      // Verify success response was created
      expect(responseUtils.createSuccessResponse).toHaveBeenCalledWith(
        mockContext,
        { success: true, id: 'list123' }
      )
      
      // Verify the response
      expect(response).toBe('success-response')
    })
    
    it('should return not found error when list does not exist', async () => {
      // Setup mock repository response
      vi.mocked(listsRepo.getListById).mockResolvedValue(null as any)
      
      // Extract the handler function
      const handlerFn = listsController.deleteListHandler[listsController.deleteListHandler.length - 1] as Function
      
      // Call the handler
      const response = await handlerFn(mockContext)
      
      // Verify error response was created
      expect(errorUtils.createErrorResponse).toHaveBeenCalledWith(
        mockContext,
        'NOT_FOUND'
      )
      
      // Verify the response
      expect(response).toBe('error-response')
    })
  })
  
  describe('toggleListFrozenHandler', () => {
    it('should toggle frozen state when user is owner', async () => {
      // Setup mock repository responses
      vi.mocked(listsRepo.getListById).mockResolvedValue(mockList as any)
      vi.mocked(listsRepo.updateList).mockResolvedValue({
        ...mockList,
        isFrozen: true,
      } as any)
      
      // Setup request data
      mockContext.req.valid = vi.fn((type) => {
        if (type === 'param') return { id: 'list123' }
        if (type === 'json') return { isFrozen: true }
        return {}
      })
      
      // Extract the handler function
      const handlerFn = listsController.toggleListFrozenHandler[listsController.toggleListFrozenHandler.length - 1] as Function
      
      // Call the handler
      const response = await handlerFn(mockContext)
      
      // Verify repositories were called with correct arguments
      expect(listsRepo.getListById).toHaveBeenCalledWith('list123')
      expect(listsRepo.updateList).toHaveBeenCalledWith('list123', { isFrozen: true })
      
      // Verify success response was created
      expect(responseUtils.createSuccessResponse).toHaveBeenCalled()
      
      // Verify the response
      expect(response).toBe('success-response')
    })
    
    it('should return not found error when list does not exist', async () => {
      // Setup mock repository response
      vi.mocked(listsRepo.getListById).mockResolvedValue(null as any)
      
      // Extract the handler function
      const handlerFn = listsController.toggleListFrozenHandler[listsController.toggleListFrozenHandler.length - 1] as Function
      
      // Call the handler
      const response = await handlerFn(mockContext)
      
      // Verify error response was created
      expect(errorUtils.createErrorResponse).toHaveBeenCalledWith(
        mockContext,
        'NOT_FOUND'
      )
      
      // Verify the response
      expect(response).toBe('error-response')
    })
  })
})
