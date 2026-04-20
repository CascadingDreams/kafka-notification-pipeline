import { describe, it, expect } from 'vitest'

// requires integration testing set up

describe('consumer', () => {
    it.todo('inserts events to postgres')
    it.todo('routes failed messages to DLQ')
    it.todo('commits offset after successful DB write')
})