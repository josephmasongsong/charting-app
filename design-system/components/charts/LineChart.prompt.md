Trend-vs-target line chart (Recharts). Reference/target lines are dashed action-blue and undotted.

```jsx
<LineChart xKey="month" series={[{key:"occupied",label:"Occupied",color:"var(--chart-1)"},{key:"target",label:"Target",color:"var(--chart-5)",dashed:true}]} data={[{month:"Jan",occupied:256,target:252}]} />
```
