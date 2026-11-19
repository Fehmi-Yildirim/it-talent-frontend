
import { apiClient } from '../../services/api/apiClient'

export type ContentLocale = 'nl' | 'en'

export interface ContentTranslation {
    id: string
    pageId: string
    locale: ContentLocale
    slug: string
    draftTitle: string | null
    draftContent: Record<string, unknown> | null
    publishedTitle: string | null
    publishedContent: Record<string, unknown> | null
    isPublished: boolean
    publishedAt: string | null
    updatedAt: string
}

export interface ContentPage {
    id: string
    createdAt: string
    updatedAt: string
    translations: ContentTranslation[]
}

export interface CreateContentRequest {
    title: string
    locale: ContentLocale
    draftContent: Record<string, unknown>
}

export interface UpdateContentTranslationRequest {
    draftTitle?: string
    draftContent?: Record<string, unknown>
}

export interface PublicContentPage {
    locale: ContentLocale
    publishedTitle: string
    publishedContent: Record<string, unknown>
    publishedAt: string
}

const adminContentEndpoint = '/admin/content'

export async function getContentPages(): Promise<ContentPage[]> {
    return apiClient.get<ContentPage[]>(adminContentEndpoint)
}

export async function getContentPage(id: string): Promise<ContentPage> {
    return apiClient.get<ContentPage>(`${adminContentEndpoint}/${id}`)
}

export async function createContentPage(
    data: CreateContentRequest,
): Promise<Omit<ContentPage, 'translations'>> {
    return apiClient.post<Omit<ContentPage, 'translations'>>(
        adminContentEndpoint,
        data,
    )
}

export async function updateContentTranslation(
    id: string,
    locale: ContentLocale,
    data: UpdateContentTranslationRequest,
): Promise<ContentTranslation> {
    return apiClient.patch<ContentTranslation>(
        `${adminContentEndpoint}/${id}/translations/${locale}`,
        data,
    )
}

export async function publishContentTranslation(
    id: string,
    locale: ContentLocale,
): Promise<ContentTranslation> {
    return apiClient.post<ContentTranslation>(
        `${adminContentEndpoint}/${id}/translations/${locale}/publish`,
    )
}

export async function unpublishContentTranslation(
    id: string,
    locale: ContentLocale,
): Promise<ContentTranslation> {
    return apiClient.post<ContentTranslation>(
        `${adminContentEndpoint}/${id}/translations/${locale}/unpublish`,
    )
}

export async function deleteContentTranslation(
    id: string,
    locale: ContentLocale,
): Promise<void> {
    return apiClient.delete<void>(
        `${adminContentEndpoint}/${id}/translations/${locale}`,
    )
}

export async function deleteContentPage(id: string): Promise<void> {
    return apiClient.delete<void>(`${adminContentEndpoint}/${id}`)
}

export async function getPublicContentPage(
    slug: string,
    locale: ContentLocale,
): Promise<PublicContentPage> {
    return apiClient.get<PublicContentPage>(
        `/content/${encodeURIComponent(slug)}/${locale}`,
    )
}
