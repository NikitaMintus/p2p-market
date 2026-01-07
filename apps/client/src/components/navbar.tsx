import * as React from "react"
import Link from "next/link"
import { NavbarUser } from "./navbar-user"

export function Navbar() {
    return (
        <nav className="border-b">
            <div className="flex h-16 items-center px-4 container mx-auto justify-between">
                <Link href="/" className="text-lg font-bold">P2P Market</Link>
                <div className="flex items-center space-x-4">
                    <NavbarUser />
                </div>
            </div>
        </nav>
    )
}
