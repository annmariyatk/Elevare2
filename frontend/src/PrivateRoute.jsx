import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const student_id = localStorage.getItem("student_id");

  if (!student_id) {
    // Not logged in → redirect to login page
    return <Navigate to="/login" replace />;
  }

  // Logged in → render the protected component
  return children;
}

export default PrivateRoute;
