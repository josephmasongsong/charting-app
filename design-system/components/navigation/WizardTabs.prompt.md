Multi-part form navigation. Completed parts turn white with a checkmark and stay clickable — users can jump back to any completed part; active part is solid tab-blue; upcoming parts sit on the gray strip. Pair with `WizardPanel`.

```jsx
<WizardTabs parts={[{label:"Part 1",state:"complete"},{label:"Part 2",state:"active"},{label:"Part 3",state:"upcoming"}]} onSelect={i=>...} />
```
