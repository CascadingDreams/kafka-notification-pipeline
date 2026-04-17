import { describe, it } from 'vitest'

describe('consumer', () => {
    it.todo('inserts events to postgres')
    it.todo('routes failed messages to DLQ')
    it.todo('commits offset after successful DB write')
})