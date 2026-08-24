Dialog with a solid teal title bar and white close glyph. Confirmations center body copy and footer actions.

```jsx
<Modal open={open} onClose={close} title="Confirmation for Final Appeal" center
  footer={<><Button variant="outline" onClick={close}>Cancel</Button><Button onClick={confirm}>Proceed</Button></>}>
  <p>By selecting confirm below...</p>
</Modal>
```
