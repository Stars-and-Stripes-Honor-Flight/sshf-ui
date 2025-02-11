import { search } from "@/services/search/search.service";

export async function getResponse(searchRequest) {
    const response = await search(searchRequest);
    return response;
}

export default { getResponse };