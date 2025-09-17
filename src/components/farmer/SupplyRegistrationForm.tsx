'use client'

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'react-toastify'
import { Loader2 } from "lucide-react"
import { useAccount, useConnect, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { contractConfig } from '@/config/wagmi.config'
import { randomIdGenerator } from '@/lib/randomIdGenerator'

export default function SupplyRegistrationForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        productName: "",
        quantity: "",
        unit: "",
        processor: "",
        harvestDate: "",
        factoryLocation: "",
        pricePerUnit: 0
    })
    const [supplyId, setSupplyId] = useState<number>()

    const data = useWriteContract()

    const handleChange = (e: any) => {
        const { name, value } = e.target
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleSelectChange = (name: string, value: string | number) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setIsSubmitting(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        const uuid = randomIdGenerator()
        setSupplyId(uuid)

        setFormData({
            productName: "",
            quantity: "",
            unit: "",
            processor: "",
            factoryLocation: "",
            harvestDate: "",
            pricePerUnit: 0
        })

        const { productName, factoryLocation, harvestDate, pricePerUnit, processor, quantity, unit } = formData

        data.writeContract({
            ...contractConfig,
            functionName: 'registerBulkSupply',
            args: [BigInt(uuid), productName, BigInt(parseInt(quantity)), unit, BigInt(pricePerUnit), factoryLocation]
        })
        console.log({ hash: data.data, data })

        setIsSubmitting(false)
    }

    useEffect(() => {
        console.log({ hsh: data.data, error: data.error })
        if (data.isError) {
            toast.error(data.error.name)
        }
        else if (data.isSuccess) {
            toast.success("Your supply has been successfully registered.", {
                className: 'bg-green-600 text-white dark:bg-green-700',
            })
        }
    }, [data.data, data.error])

    const { address, isConnecting } = useAccount()
    const { connectors } = useConnect()

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <Label htmlFor="productName">Product Name</Label>
                <Input
                    id="productName"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    placeholder="e.g., Organic Apples"
                    className="bg-green-50 dark:bg-green-900"
                />
            </div>
            <div className="flex space-x-4">
                <div className="flex-1">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleChange}
                        className="bg-green-50 dark:bg-green-900"
                    />
                </div>
                <div className="flex-1">
                    <Label htmlFor="unit">Unit</Label>
                    <Select onValueChange={(value) => handleSelectChange("unit", value)} value={formData.unit}>
                        <SelectTrigger className="bg-green-50 dark:bg-green-900">
                            <SelectValue placeholder="Select a unit" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="kg">Kilograms (kg)</SelectItem>
                            <SelectItem value="ton">Tons</SelectItem>
                            <SelectItem value="lb">Pounds (lb)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className='flex-1'>
                    <Label htmlFor="pricePerUnit">Price Per Unit</Label>
                    <Input
                        id="pricePerUnit"
                        name="pricePerUnit"
                        type="number"
                        value={formData.pricePerUnit}
                        onChange={handleChange}
                        placeholder="e.g., $300"
                        className="bg-green-50 dark:bg-green-900"
                    />
                </div>
            </div>
            {/* <div>
                <Label htmlFor="processor">Processor</Label>
                <Select onValueChange={(value) => handleSelectChange("processor", value)} value={formData.processor}>
                    <SelectTrigger className="bg-green-50 dark:bg-green-900">
                        <SelectValue placeholder="Select a processor" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="processor1">Green Valley Foods</SelectItem>
                        <SelectItem value="processor2">Farm Fresh Processors</SelectItem>
                        <SelectItem value="processor3">Organic Harvest Co.</SelectItem>
                    </SelectContent>
                </Select>
            </div> */}

            <div>
                <Label htmlFor="productName">Factory Location</Label>
                <Input
                    id="factoryLocation"
                    name="factoryLocation"
                    value={formData.factoryLocation}
                    onChange={handleChange}
                    placeholder="e.g., 456 Elm Street, Suite 3, Los Angeles, USA"
                    className="bg-green-50 dark:bg-green-900"
                />
            </div>

            <div>
                <Label htmlFor="harvestDate">Factory Location</Label>
                <Input
                    id="harvestDate"
                    name="harvestDate"
                    value={formData.harvestDate}
                    type="date"
                    onChange={handleChange}
                    placeholder="e.g., 456 Elm Street, Suite 3, Los Angeles, USA"
                    className="bg-green-50 dark:bg-green-900"
                />
            </div>

            {supplyId && <div className='py-3 text-sm font-bold text-green-600'>
                New Supply Id Generated: {supplyId}
            </div>}

            {
                address ? <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                        </>
                    ) : (
                        'Register Supply'
                    )}
                </Button> :
                    <Button type="button" onClick={() => connectors[0].connect()} className="w-full bg-green-600 hover:bg-green-700" disabled={isConnecting}>
                        {isConnecting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Connecting...
                            </>
                        ) : (
                            'Connect MetaMask'
                        )}
                    </Button>
            }

        </form>
    )
}