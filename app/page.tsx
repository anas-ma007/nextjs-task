import React from 'react'
import Link from "next/link"

const page = () => {
  return (
    <div >
     Home Page Navigate to =>
      <Link className='text-blue-800' href={"/participant/availability"}> /participant/availability </Link>
    </div>
  )
}

export default page