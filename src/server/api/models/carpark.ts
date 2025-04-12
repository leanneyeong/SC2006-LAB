interface CarParkProps {
    id: string
    carParkNo: string
    address: string
    location: Location
    carParkType: string
    typeOfParkingSystem: string
    shortTermParking: string
    freeParking: string
    nightParking: string
    carParkDecks: string
    gantryHeight: string
    carParkBasement: string
    availableLots: number
    createdAt: Date
    updatedAt: Date
}

export class CarPark {
    constructor(private readonly props: Readonly<CarParkProps>){}

    public getValue(): CarParkProps{
        return this.props;
    }

    public setAvailableLots(availableLots: number) {
        return new CarPark({
            ...this.props,
            availableLots
        })
    }
}
