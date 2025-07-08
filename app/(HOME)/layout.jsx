"use client";
import React, { useState } from "react";

function DashboardLayout({ children }) {
  return (
    <div>
        <div className="p-3">{children}</div> 
    </div>
  );
}

export default DashboardLayout;
