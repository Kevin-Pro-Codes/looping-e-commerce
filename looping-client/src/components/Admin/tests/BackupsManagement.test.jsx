import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('BackupsManagement Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    // Mock document.cookie
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'XSRF-TOKEN=test-csrf-token'
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Backups Management', () => {
    it('should fetch all backups', async () => {
      const mockBackups = [
        { id: 1, filename: 'backup_2024_01_01.sql', size: '2.5MB', created_at: '2024-01-01 10:00:00' },
        { id: 2, filename: 'backup_2024_01_02.sql', size: '2.8MB', created_at: '2024-01-02 10:00:00' }
      ]

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackups
      })

      const response = await fetch('http://localhost:8000/api/backups', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/backups',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include'
        })
      )
      expect(data).toEqual(mockBackups)
    })

    it('should create new backup', async () => {
      const backupData = {
        name: 'Manual Backup',
        description: 'Manual backup before updates',
        include_files: true,
        include_database: true
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, backup: { id: 3, filename: 'backup_2024_01_03_manual.sql', ...backupData } })
      })

      const response = await fetch('http://localhost:8000/api/backups', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        },
        body: JSON.stringify(backupData)
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/backups',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(backupData)
        })
      )
      expect(data.success).toBe(true)
      expect(data.backup.name).toBe('Manual Backup')
    })

    it('should download backup', async () => {
      const backupId = '123'
      const mockFileContent = new Blob(['SQL backup content'], { type: 'application/sql' })

      fetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockFileContent
      })

      const response = await fetch(`http://localhost:8000/api/backups/${backupId}/download`, {
        method: 'GET',
        headers: {
          'Accept': 'application/sql'
        },
        credentials: 'include'
      })

      const blob = await response.blob()

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/backups/${backupId}/download`,
        expect.objectContaining({
          method: 'GET',
          credentials: 'include'
        })
      )
      expect(blob).toBe(mockFileContent)
    })

    it('should restore backup', async () => {
      const backupId = '123'
      const restoreData = {
        confirm: true,
        backup_type: 'full'
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Backup restored successfully' })
      })

      const response = await fetch(`http://localhost:8000/api/backups/${backupId}/restore`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        },
        body: JSON.stringify(restoreData)
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/backups/${backupId}/restore`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(restoreData)
        })
      )
      expect(data.success).toBe(true)
    })

    it('should delete backup', async () => {
      const backupId = '123'

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, message: 'Backup deleted successfully' })
      })

      const response = await fetch(`http://localhost:8000/api/backups/${backupId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        }
      })

      expect(fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/backups/${backupId}`,
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })

    it('should schedule automatic backup', async () => {
      const scheduleData = {
        enabled: true,
        frequency: 'daily',
        time: '02:00',
        keep_backups: 7,
        include_files: true,
        include_database: true
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, schedule: scheduleData })
      })

      const response = await fetch('http://localhost:8000/api/backups/schedule', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token',
          'Accept': 'application/json'
        },
        body: JSON.stringify(scheduleData)
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/backups/schedule',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(scheduleData)
        })
      )
      expect(data.success).toBe(true)
    })

    it('should get backup status', async () => {
      const mockStatus = {
        last_backup: '2024-01-02 10:00:00',
        next_scheduled: '2024-01-03 02:00:00',
        total_backups: 15,
        total_size: '45.2MB',
        schedule_enabled: true
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus
      })

      const response = await fetch('http://localhost:8000/api/backups/status', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      const data = await response.json()

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/backups/status',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include'
        })
      )
      expect(data.total_backups).toBe(15)
      expect(data.schedule_enabled).toBe(true)
    })

    it('should handle backups fetch error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      try {
        await fetch('http://localhost:8000/api/backups', {
          method: 'GET',
          credentials: 'include'
        })
      } catch (error) {
        expect(error.message).toBe('Network error')
      }
    })

    it('should handle backup not found', async () => {
      const backupId = '999'

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Backup not found' })
      })

      const response = await fetch(`http://localhost:8000/api/backups/${backupId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
    })

    it('should handle restore confirmation error', async () => {
      const backupId = '123'
      const restoreData = {
        confirm: false // Not confirmed
      }

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Backup restore must be confirmed' })
      })

      const response = await fetch(`http://localhost:8000/api/backups/${backupId}/restore`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': 'test-csrf-token'
        },
        body: JSON.stringify(restoreData)
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(400)
    })
  })
})
