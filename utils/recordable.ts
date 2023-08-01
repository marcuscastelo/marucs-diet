import { Record } from 'pocketbase'

export type Recordable<TRaw, TRecorded = TRaw & Record> =
  | ({
      recorded: true
    } & TRecorded)
  | ({
      recorded: false
    } & TRaw)
