import { TRPCError } from "@trpc/server";
import { HousingDevelopmentBoard } from "../external/housing-development-board";
import { CarPark } from "../models/carpark";
import { carParkRepository } from "../repositories";

export class HDBDataService {

    private hdb: HousingDevelopmentBoard;
    
    constructor(){
        this.hdb = new HousingDevelopmentBoard()
    }

    public async processData(){
        const rawHDBData = await this.hdb.getAvailability();
        console.log('Raw HDB Data:', rawHDBData);  // Log raw data
        const carParks = await carParkRepository.findAll();

        const updatedCarParks : CarPark[] = []

        //For each raw data, find the corresponding matching carpark in the db. Then get the db record. then update all!
        rawHDBData.map((raw) => {
            const carParkNumber = raw.carpark_number;
            const carParkInfo = raw.carpark_info[0]!
            const availableLots = carParkInfo.lots_available

            console.log(`Processing: ${carParkNumber}, Available Lots: ${availableLots}`);  // Log each processing step

            const foundCarPark = carParks.find(carPark => carPark.getValue().carParkNo == carParkNumber)
            if(!foundCarPark) throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:"Mismatch"
            })
            //if match found, updates available lots for that carpark to an array called updatedCarParks
            updatedCarParks.push(foundCarPark.setAvailableLots(availableLots))

        })

        await carParkRepository.updateMany(updatedCarParks);
        return;

    }
}