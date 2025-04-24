import forEach from "lodash/forEach";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";

const ActivityPagination = ({
  page,
  totalPages,
  searchParams,
}: {
  page?: string;
  totalPages: number;
  searchParams: Record<string, string | string[]>;
}) => {
  const parsedPage = page ? Number(page) : 1;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();

    forEach(searchParams, (value, key) => {
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, value);
      }
    });

    params.set("page", pageNumber.toString());

    return `?${params.toString()}`;
  };

  const pageNumbers = getPageNumbers(parsedPage, totalPages);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={parsedPage === 1}
            href={createPageUrl(parsedPage - 1)}
          />
        </PaginationItem>

        {pageNumbers.map((pageNumber, index) =>
          pageNumber === null ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href={createPageUrl(pageNumber)}
                isActive={parsedPage === pageNumber}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            disabled={parsedPage === totalPages}
            href={createPageUrl(parsedPage + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

const getPageNumbers = (
  parsedPage: number,
  totalPages: number,
): (number | null)[] => {
  const pages: (number | null)[] = [];
  const MAX_VISIBLE_PAGES = 5;

  if (totalPages <= MAX_VISIBLE_PAGES) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    let start = Math.max(2, parsedPage - 1);
    let end = Math.min(totalPages - 1, parsedPage + 1);

    if (parsedPage <= 3) {
      end = Math.min(totalPages - 1, 4);
    } else if (parsedPage >= totalPages - 2) {
      start = Math.max(2, totalPages - 3);
    }

    if (start > 2) {
      pages.push(null);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push(null);
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }
  }

  return pages;
};

export default ActivityPagination;
