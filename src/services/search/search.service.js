import db from '@/services/db/client.js';
import { SearchRequest } from '@/models/search_request.js';
import { SearchResults } from '@/models/search_results.js';

export async function search(searchRequest) {
    try {
        const request  = new SearchRequest(searchRequest);
        const data = db.view('basic', 'all_by_status_and_name', {
            limit : request.limit,
            startkey : request.startkey,
            endkey : request.endkey,
            descending : "false",
            type : "newRows"
        });
        
        return new SearchResults(data);
    } catch (error) {
        console.error('Database connection error:', error);
        throw error;
    }
}

