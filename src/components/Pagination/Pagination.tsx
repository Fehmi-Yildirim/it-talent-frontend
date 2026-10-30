import './Pagination.css'
import { useTranslation } from '../../i18n/useTranslation'

type PaginationProps = {
    currentPage: number
    totalItems: number
    itemsPerPage: number
    onPageChange: (page: number) => void
}

function Pagination({
    currentPage,
    totalItems,
    itemsPerPage,
    onPageChange,
}: PaginationProps) {
    const { t } = useTranslation()

    if (
        totalItems <= 0 ||
        itemsPerPage <= 0 ||
        !Number.isInteger(itemsPerPage)
    ) {
        return null
    }

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    if (totalPages <= 1) {
        return null
    }

    const safeCurrentPage = Math.min(
        Math.max(1, currentPage),
        totalPages,
    )

    const goToPage = (page: number) => {
        if (
            page < 1 ||
            page > totalPages ||
            page === safeCurrentPage
        ) {
            return
        }

        onPageChange(page)
    }

    // Show the first page, last page and nearby pages.
    const visiblePages = new Set<number>([1, totalPages])

    for (
        let page = safeCurrentPage - 2;
        page <= safeCurrentPage + 2;
        page++
    ) {
        if (page >= 1 && page <= totalPages) {
            visiblePages.add(page)
        }
    }

    const sortedPages = [...visiblePages].sort((a, b) => a - b)

    return (
        <nav
            className="pagination"
            aria-label={t('common.pagination')}
        >
            <button
                type="button"
                className="pagination__button"
                onClick={() => goToPage(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
            >
                {t('common.previous')}
            </button>

            <div className="pagination__pages">
                {sortedPages.map((page, index) => {
                    const previousPage = sortedPages[index - 1]
                    const hasGap = index > 0 && page - previousPage > 1

                    return (
                        <span
                            key={page}
                            className="pagination__item"
                        >
                            {hasGap && (
                                <span
                                    className="pagination__ellipsis"
                                    aria-hidden="true"
                                >
                                    …
                                </span>
                            )}

                            <button
                                type="button"
                                className="pagination__button pagination__page"
                                onClick={() => goToPage(page)}
                                aria-label={`${t('common.page')} ${page}`}
                                aria-current={
                                    page === safeCurrentPage
                                        ? 'page'
                                        : undefined
                                }
                                disabled={page === safeCurrentPage}
                            >
                                {page}
                            </button>
                        </span>
                    )
                })}
            </div>

            <button
                type="button"
                className="pagination__button"
                onClick={() => goToPage(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
            >
                {t('common.next')}
            </button>
        </nav>
    )
}

export default Pagination
