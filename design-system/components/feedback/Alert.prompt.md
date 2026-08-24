Inline banner for form validation, warnings, notices, and empty states. A colour never means two things on one screen — pick the variant that matches the message's real severity.

```jsx
<Alert variant="validation" title="The form could not be submitted for the following reasons:">
  <a href="#">What is your purpose... is a required field.</a>
</Alert>
<Alert variant="empty">There are no folders or files to display.</Alert>
```

Variants: `validation` (red-50, page-top summary), `destructive` (red-100 + 5px red left border, inline), `warning` (yellow-50), `notice` (pink #FBEAEA), `empty` (tan-50, muted).
