"use client";

import { useState, useEffect, useCallback } from "react";
import {
  listSearchInputClass,
  listSelectTriggerClass,
} from '@/components/ui/list-controls';
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Home, Search, Loader2 } from "lucide-react";
import { PaginationFooter } from "@/components/ui/pagination-footer";
import { DirectoryRow } from "@/components/ui/directory-row";
import { RowActions } from "@/components/ui/row-actions";
import { cn } from "@/lib/utils";

import DeleteSiteDialog from "./DeleteSiteDialog";

interface Site {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  address: string;
  numberOfTenants: number;
  hasCommunityRoom: boolean;
  hasCommunityPartner: boolean;
  communityPartnerId: string | null;
  communityPartnerName: string | null;
  isSingleSeniorOnly: boolean;
  region: string;
  tewId: string;
  tewName: string;
  pphId: string | null;
  pphName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

type SortOrder = "asc" | "desc";

interface SortConfig {
  field: string;
  order: SortOrder;
}


const siteTileClass =
  "grid size-11 shrink-0 place-items-center rounded-(--radius-avatar) bg-(--bch-teal-600) text-white";
const alertClass = "border-y-0 border-r-0 px-3.5 py-3";
const successAlertClass =
  "rounded-[2px] border-l-[5px] border-l-(--success) bg-[var(--bch-green-50,#EDF6EF)] text-foreground";

export default function SitesTable() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "name",
    order: "asc",
  });
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Delete site state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingSite, setDeletingSite] = useState<Site | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch sites
  const fetchSites = useCallback(
    async (page = 1, searchTerm = "", sort = sortConfig) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          sortBy: sort.field,
          sortOrder: sort.order,
          ...(searchTerm && { search: searchTerm }),
        });

        const response = await fetch(`/api/admin/sites?${params}`);
        const data = await response.json();

        if (response.ok) {
          setSites(data.sites);
          setPagination(data.pagination);
          setError("");
        } else {
          setError(data.error || "Failed to fetch sites");
        }
      } catch (error) {
        setError("Network error occurred");
      } finally {
        setLoading(false);
      }
    },
    [sortConfig],
  );

  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  // Clear messages after some time
  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSites(1, search, sortConfig);
  };

  // Handle sorting
  const handleSortChange = (value: string) => {
    const [field, order] = value.split(":");
    const newSortConfig = { field, order: order as SortOrder };
    setSortConfig(newSortConfig);
    fetchSites(1, search, newSortConfig);
  };

  // Handle delete site
  const openDeleteSite = (site: Site) => {
    setDeletingSite(site);
    setDeleteOpen(true);
  };

  // Refresh data after CRUD operations
  const refreshData = () => {
    fetchSites(pagination.page, search, sortConfig);
  };

  // Handle success/error messages
  const showMessage = (msg: string) => {
    setMessage(msg);
    setError("");
  };

  const showError = (err: string) => {
    setError(err);
    setMessage("");
  };

  return (
    <>
      {/* Messages */}
      {message && (
        <Alert className={cn(alertClass, successAlertClass, "mb-4")}>
          <AlertDescription className="text-[14px] text-foreground">
            {message}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className={cn(alertClass, "mb-4")}>
          <AlertDescription className="text-[14px]">{error}</AlertDescription>
        </Alert>
      )}

      {/* Sites Data Table */}
      <div className="overflow-hidden rounded-(--radius-card) border border-(--border-default) bg-(--surface-card) shadow-(--shadow-card)">
        <div className="flex flex-wrap items-center gap-4 border-b border-(--border-default) px-5 py-4">
          <form
            onSubmit={handleSearch}
            className="relative flex w-[340px] max-w-full items-center"
          >
            <button
              type="submit"
              aria-label="Search"
              className="absolute left-2.5 flex cursor-pointer text-(--bch-gray-500)"
            >
              <Search className="size-4" />
            </button>
            <Input
              placeholder="Search by name, address, user, or community partner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={listSearchInputClass}
            />
          </form>
          <Select
            value={`${sortConfig.field}:${sortConfig.order}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger aria-label="Sort by" className={cn(listSelectTriggerClass, "w-[190px]")}>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name:asc">Name (A–Z)</SelectItem>
              <SelectItem value="name:desc">Name (Z–A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-(--text-muted)">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading...
          </div>
        ) : (
          <>
            <div>
              {sites.length === 0 ? (
                <div className="px-4 py-10 text-center text-(--text-muted)">
                  {search ? (
                    <>
                      No sites found matching &quot;{search}&quot;.
                      <Button
                        variant="link"
                        onClick={() => {
                          setSearch("");
                          fetchSites(1, "", sortConfig);
                        }}
                        className="ml-1 h-auto p-0 text-[14px] text-(--action-primary)"
                      >
                        Clear search
                      </Button>
                    </>
                  ) : (
                    "No sites found."
                  )}
                </div>
              ) : (
                sites.map((site) => (
                  <DirectoryRow
                    key={site.id}
                    leading={
                      <div className={siteTileClass}>
                        <Home size={19} />
                      </div>
                    }
                    title={site.name}
                    actions={
                      <RowActions
                        label={`Actions for ${site.name}`}
                        actions={[
                          { label: "View", href: `/sites/${site.id}` },
                          {
                            label: "Edit",
                            onSelect: () =>
                              router.push(`/admin/sites/${site.id}/edit`),
                          },
                          {
                            label: "Delete",
                            danger: true,
                            onSelect: () => openDeleteSite(site),
                          },
                        ]}
                      />
                    }
                  />
                ))
              )}
            </div>

            <PaginationFooter
              page={pagination.page}
              pages={pagination.pages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={(page) => fetchSites(page, search, sortConfig)}
            />
          </>
        )}
      </div>

      {/* Delete Site Dialog */}
      <DeleteSiteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        site={deletingSite}
        onSuccess={showMessage}
        onError={showError}
        onRefresh={refreshData}
      />
    </>
  );
}
