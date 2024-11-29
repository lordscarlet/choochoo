import { Link } from "react-router-dom";

export function AdminPage() {
  // TODO: figure out how to put this in the header as a dropdown.
  return <div>
    <p>
      <Link to="/app/admin/create-invite">Create Invitation</Link>
    </p>
    <p>
      <Link to="/app/admin/feedback">View Feedback</Link>
    </p>
    <p>
      <Link to="/app/admin/users">View users</Link>
    </p>
  </div>
}