import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { Channel, ChannelStats, CreateChannelBody, GetChannelMessagesParams, HealthStatus, Message, SendMessageBody, User } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * Returns server health status
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all channels
 */
export declare const getListChannelsUrl: () => string;
export declare const listChannels: (options?: RequestInit) => Promise<Channel[]>;
export declare const getListChannelsQueryKey: () => readonly ["/api/channels"];
export declare const getListChannelsQueryOptions: <TData = Awaited<ReturnType<typeof listChannels>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listChannels>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listChannels>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListChannelsQueryResult = NonNullable<Awaited<ReturnType<typeof listChannels>>>;
export type ListChannelsQueryError = ErrorType<unknown>;
/**
 * @summary List all channels
 */
export declare function useListChannels<TData = Awaited<ReturnType<typeof listChannels>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listChannels>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Create a channel
 */
export declare const getCreateChannelUrl: () => string;
export declare const createChannel: (createChannelBody: CreateChannelBody, options?: RequestInit) => Promise<Channel>;
export declare const getCreateChannelMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createChannel>>, TError, {
        data: BodyType<CreateChannelBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createChannel>>, TError, {
    data: BodyType<CreateChannelBody>;
}, TContext>;
export type CreateChannelMutationResult = NonNullable<Awaited<ReturnType<typeof createChannel>>>;
export type CreateChannelMutationBody = BodyType<CreateChannelBody>;
export type CreateChannelMutationError = ErrorType<unknown>;
/**
 * @summary Create a channel
 */
export declare const useCreateChannel: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createChannel>>, TError, {
        data: BodyType<CreateChannelBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createChannel>>, TError, {
    data: BodyType<CreateChannelBody>;
}, TContext>;
/**
 * @summary Get a channel
 */
export declare const getGetChannelUrl: (id: number) => string;
export declare const getChannel: (id: number, options?: RequestInit) => Promise<Channel>;
export declare const getGetChannelQueryKey: (id: number) => readonly [`/api/channels/${number}`];
export declare const getGetChannelQueryOptions: <TData = Awaited<ReturnType<typeof getChannel>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getChannel>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getChannel>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetChannelQueryResult = NonNullable<Awaited<ReturnType<typeof getChannel>>>;
export type GetChannelQueryError = ErrorType<void>;
/**
 * @summary Get a channel
 */
export declare function useGetChannel<TData = Awaited<ReturnType<typeof getChannel>>, TError = ErrorType<void>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getChannel>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get messages for a channel
 */
export declare const getGetChannelMessagesUrl: (id: number, params?: GetChannelMessagesParams) => string;
export declare const getChannelMessages: (id: number, params?: GetChannelMessagesParams, options?: RequestInit) => Promise<Message[]>;
export declare const getGetChannelMessagesQueryKey: (id: number, params?: GetChannelMessagesParams) => readonly [`/api/channels/${number}/messages`, ...GetChannelMessagesParams[]];
export declare const getGetChannelMessagesQueryOptions: <TData = Awaited<ReturnType<typeof getChannelMessages>>, TError = ErrorType<unknown>>(id: number, params?: GetChannelMessagesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getChannelMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getChannelMessages>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetChannelMessagesQueryResult = NonNullable<Awaited<ReturnType<typeof getChannelMessages>>>;
export type GetChannelMessagesQueryError = ErrorType<unknown>;
/**
 * @summary Get messages for a channel
 */
export declare function useGetChannelMessages<TData = Awaited<ReturnType<typeof getChannelMessages>>, TError = ErrorType<unknown>>(id: number, params?: GetChannelMessagesParams, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getChannelMessages>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Send a message to a channel
 */
export declare const getSendMessageUrl: (id: number) => string;
export declare const sendMessage: (id: number, sendMessageBody: SendMessageBody, options?: RequestInit) => Promise<Message>;
export declare const getSendMessageMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        id: number;
        data: BodyType<SendMessageBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
    id: number;
    data: BodyType<SendMessageBody>;
}, TContext>;
export type SendMessageMutationResult = NonNullable<Awaited<ReturnType<typeof sendMessage>>>;
export type SendMessageMutationBody = BodyType<SendMessageBody>;
export type SendMessageMutationError = ErrorType<unknown>;
/**
 * @summary Send a message to a channel
 */
export declare const useSendMessage: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof sendMessage>>, TError, {
        id: number;
        data: BodyType<SendMessageBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof sendMessage>>, TError, {
    id: number;
    data: BodyType<SendMessageBody>;
}, TContext>;
/**
 * @summary Get current user profile
 */
export declare const getGetMeUrl: () => string;
export declare const getMe: (options?: RequestInit) => Promise<User>;
export declare const getGetMeQueryKey: () => readonly ["/api/users/me"];
export declare const getGetMeQueryOptions: <TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetMeQueryResult = NonNullable<Awaited<ReturnType<typeof getMe>>>;
export type GetMeQueryError = ErrorType<void>;
/**
 * @summary Get current user profile
 */
export declare function useGetMe<TData = Awaited<ReturnType<typeof getMe>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getMe>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Sync current user from Clerk to DB
 */
export declare const getSyncMeUrl: () => string;
export declare const syncMe: (options?: RequestInit) => Promise<User>;
export declare const getSyncMeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof syncMe>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof syncMe>>, TError, void, TContext>;
export type SyncMeMutationResult = NonNullable<Awaited<ReturnType<typeof syncMe>>>;
export type SyncMeMutationError = ErrorType<unknown>;
/**
 * @summary Sync current user from Clerk to DB
 */
export declare const useSyncMe: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof syncMe>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof syncMe>>, TError, void, TContext>;
/**
 * @summary Get stats for a channel
 */
export declare const getGetChannelStatsUrl: (id: number) => string;
export declare const getChannelStats: (id: number, options?: RequestInit) => Promise<ChannelStats>;
export declare const getGetChannelStatsQueryKey: (id: number) => readonly [`/api/channels/${number}/stats`];
export declare const getGetChannelStatsQueryOptions: <TData = Awaited<ReturnType<typeof getChannelStats>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getChannelStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getChannelStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetChannelStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getChannelStats>>>;
export type GetChannelStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get stats for a channel
 */
export declare function useGetChannelStats<TData = Awaited<ReturnType<typeof getChannelStats>>, TError = ErrorType<unknown>>(id: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getChannelStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map