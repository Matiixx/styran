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
}: {
  page?: string;
  totalPages: number;
}) => {
  const parsedPage = page ? Number(page) : 1;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            disabled={parsedPage === 1}
            href={`?page=${parsedPage - 1}`}
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
            href={`?page=${parsedPage + 1}`}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ActivityPagination;
