export type CommandHandler<TCommand, TResult> = (command: TCommand) => Promise<TResult>
export type QueryHandler<TQuery, TResult> = (query: TQuery) => Promise<TResult>
