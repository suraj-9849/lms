import GlassSheet from "@/components/global/glass-sheet"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, MenuIcon } from "lucide-react"
import { ThemeDropDown } from "./ThemeDropDown"

const Navbar = () => {
  return (
    <div className="w-full flex justify-between sticky top-0 items-center py-5 px-3 z-50">
      <Link href={"/"} >
      <p className="font-bold text-2xl">Ignify.</p>
      </Link>
      <div className="flex gap-2">
        <Link href="/signin">
          <Button
            variant="outline"
            className="bg-themeBlack rounded-2xl flex gap-2 border-themeGray hover:bg-themeGray"
          >
           <LogOut/>
            Login
          </Button>
        </Link>
        <GlassSheet
          triggerClass="lg:hidden"
          trigger={
            <Button variant="ghost" className="hover:bg-transparent">
              <MenuIcon size={30} />
            </Button>
          }
        >
        </GlassSheet>
        <ThemeDropDown/>
      </div>
    </div>
  )
}

export default Navbar