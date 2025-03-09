"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface RaffleTypeSelectorProps {
  onSelect: (raffleType: string) => void
}

export function RaffleTypeSelector({ onSelect }: RaffleTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelect("team-matching")}>
        <CardHeader>
          <CardTitle>Takım Eşleştirme</CardTitle>
          <CardDescription>Takımlar ve adaylar arasında rastgele eşleştirme yapın</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Bu çekiliş türü, takımlar ve adaylar arasında rastgele eşleştirme yapar. 
            Önceden tanımlanmış lig takımlarını kullanabilir veya kendi takımlarınızı ekleyebilirsiniz.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Seç</Button>
        </CardFooter>
      </Card>
      
      <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelect("regular")}>
        <CardHeader>
          <CardTitle>Normal Çekiliş</CardTitle>
          <CardDescription>Basit bir liste içinden rastgele seçim yapın</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Bu çekiliş türü, bir liste içinden rastgele öğeler seçer. 
            İsimler, numaralar veya herhangi bir öğe listesi kullanabilirsiniz.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Seç</Button>
        </CardFooter>
      </Card>
    </div>
  )
}