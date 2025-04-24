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

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={parsedPage === 1}
            href={createPageUrl(parsedPage - 1)}
          />
        </PaginationItem>

        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
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

export default ActivityPagination;
