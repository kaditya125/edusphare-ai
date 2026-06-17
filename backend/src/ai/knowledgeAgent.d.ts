export declare class CentralKnowledgeAgent {
    /**
     * Retrieves context from the Vector Database based on a semantic query.
     * @param query The natural language query from the user.
     * @param topK Number of chunks to retrieve.
     * @param filters Optional metadata filters (e.g. { accessLevel: 'public' })
     * @returns Formatted string of context
     */
    static retrieveContext(query: string, topK?: number, filters?: Record<string, any>): Promise<string>;
}
//# sourceMappingURL=knowledgeAgent.d.ts.map