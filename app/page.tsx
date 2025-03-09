"use client"

import { Suspense } from 'react'
import RaffleApp from "../raffle-app"

export default function SyntheticV0PageForDeployment() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <RaffleApp />
    </Suspense>
  )
}