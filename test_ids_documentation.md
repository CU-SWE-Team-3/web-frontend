# Blocked Users Feature - Test IDs Documentation

This document outlines the `data-testid` attributes implemented in the Blocked Users List feature (`/settings/blocked`). These IDs are stable and intended for use by the QA/Testing team for automated E2E and integration testing.

## Component: BlockedUsersList

| Test ID | Description | State |
|---------|-------------|-------|
| `blocked-users-list` | The main container for the list of blocked users. | Success State |
| `blocked-empty-state` | The container displaying the "You haven't blocked anyone" message. | Empty State |
| `blocked-loading` | The container holding the skeleton loading placeholder rows. | Loading State |

## Component: BlockedUserRow

| Test ID | Description |
|---------|-------------|
| `blocked-user-row` | The container for a single blocked user row in the list. |
| `blocked-user-avatar`| The avatar component displaying the user's image or fallback initials. |
| `blocked-user-username`| The container holding the user's `@username` and display name. |
| `unblock-button` | The clickable button to unblock the user. |

---

### Example Usage (Cypress)
```javascript
// Check if the list renders
cy.get('[data-testid="blocked-users-list"]').should('exist')

// Check the empty state
cy.get('[data-testid="blocked-empty-state"]').should('contain.text', "You haven't blocked anyone")

// Click the first unblock button
cy.get('[data-testid="unblock-button"]').first().click()
```

### Example Usage (React Testing Library)
```javascript
// Wait for loading to finish
await waitForElementToBeRemoved(() => screen.queryByTestId('blocked-loading'))

// Verify specific user row
const firstRow = screen.getAllByTestId('blocked-user-row')[0]
expect(within(firstRow).getByTestId('blocked-user-username')).toHaveTextContent('user_alias')
```
