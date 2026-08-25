Recharts bar chart matching the Power BI house style (shadcn guide §4.11): seafoam-first / sky-second series colors, horizontal gridlines only, value labels at bar ends, no axis lines.

```jsx
<BarChart title="Total Approved FTE by Branch" xKey="branch" layout="vertical"
  series={[{key:"regular",label:"Regular",color:"var(--chart-1)"},{key:"shortTerm",label:"Short Term",color:"var(--chart-2)"}]}
  data={[{branch:"IT",regular:60,shortTerm:2}]} />
```

Use `layout="horizontal"` (single series) for ranked region/category breakdowns.
