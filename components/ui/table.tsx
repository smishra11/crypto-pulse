"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Renders a table element wrapped in a responsive, horizontally scrollable container.
 *
 * @param className - Additional CSS class names to apply to the table element
 * @returns A table element inside a div that enables horizontal scrolling when content overflows
 */
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

/**
 * Renders a table header element with a slot attribute and combined styling.
 *
 * @param className - Additional CSS class names applied to the `<thead>` element
 * @returns The rendered `<thead>` element with `data-slot="table-header"` and merged classes
 */
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

/**
 * Renders a table body element with default styling that removes the bottom border from the last row.
 *
 * @param className - Additional class names to merge with the component's default classes
 * @returns The rendered `tbody` element
 */
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

/**
 * Renders a styled table footer (tfoot) element.
 *
 * @param className - Additional CSS class names to merge with the component's default footer classes
 * @returns The rendered `tfoot` element
 */
function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a table row (<tr>) element with standardized slot attribute and row styling while forwarding all props.
 *
 * @returns A table row element (`<tr>`) with the component's row classes merged with any provided `className` and all other props applied.
 */
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a styled table header cell used by the table components.
 *
 * @returns A `th` element with `data-slot="table-head"` and predefined alignment, spacing, typography, and checkbox-aware styles.
 */
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a table data cell with standardized padding, vertical alignment, no-wrapping text, and adjusted spacing when it contains a checkbox.
 *
 * @returns A `td` element with `data-slot="table-cell"` and a merged `className` that applies the described layout and checkbox-aware adjustments.
 */
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a styled table caption element.
 *
 * @param className - Additional CSS class names to merge with the component's default caption styles
 * @returns The caption element with muted foreground, top margin, small text size, and any provided className applied
 */
function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}