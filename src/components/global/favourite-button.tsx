import { TRPCClientError } from "@trpc/client"
import { Heart } from "lucide-react"
import toast from "react-hot-toast"
import { api } from "~/utils/api"
import { Button } from "~/components/ui/button" // Make sure to import the Button component

interface FavouriteButtonProps {
    carParkId: string
    isFavourited: boolean
}

export const FavouriteButton = ({carParkId, isFavourited}: FavouriteButtonProps) => {
    const carParkContext = api.useUtils().carPark
    const userContext = api.useUtils().user;
    const {
        mutateAsync: setFavouriteMutationAsync
    } = api.carPark.setFavourite.useMutation()
    
    const handleChange = async () => {
        await toast.promise(
            setFavouriteMutationAsync({
                id: carParkId,
                isFavourited: !isFavourited
            }),
            {
                loading: "Please hold...",
                success: ()=>{
                    void carParkContext.invalidate()
                    void userContext.invalidate();
                    return "Carpark has been updated successfully!"
                },
                error: (error) => {
                    if (error instanceof TRPCClientError) {
                        return error.message;
                    }
                    return "Failed to favourite carpark";
                }
            }
        )
    }

    return (
        <Button 
            className={`flex items-center gap-2 ${isFavourited ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            onClick={handleChange}
        >
            <Heart
                size={18}
                fill={isFavourited ? "white" : "none"}
                stroke="white"
            />
            {isFavourited ? "Favourited" : "Favourite"}
        </Button>
    )
}