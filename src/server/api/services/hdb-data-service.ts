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
        try {
            const rawHDBData = await this.hdb.getAvailability();
            console.log('Raw HDB Data:', rawHDBData);  // Log raw data
            const carParks = await carParkRepository.findAll();
            console.log('Total Carparks in DB:', carParks.length);  // Log total carparks

            const updatedCarParks : CarPark[] = []
            let matchCount = 0;
            let skipCount = 0;

            // For each raw data, find the corresponding matching carpark in the db
            rawHDBData.forEach((raw) => {
                const carParkNumber = raw.carpark_number;
                const carParkInfo = raw.carpark_info[0];
                
                if (!carParkInfo) {
                    console.log(`Skipping ${carParkNumber}: No carpark info available`);
                    skipCount++;
                    return; // Skip this iteration
                }
                
                const availableLots = carParkInfo.lots_available;

                console.log(`Processing: ${carParkNumber}, Available Lots: ${availableLots}`);

                const foundCarPark = carParks.find(carPark => carPark.getValue().carParkNo == carParkNumber);
                
                if(!foundCarPark) {
                    console.log(`Skipping carpark ${carParkNumber} - not found in database`);
                    skipCount++;
                    return; // Skip this one instead of throwing error
                }
                
                // If match found, updates available lots for that carpark
                updatedCarParks.push(foundCarPark.setAvailableLots(availableLots));
                matchCount++;
            });

            console.log(`Matched: ${matchCount} carparks, Skipped: ${skipCount} carparks`);
            console.log(`Updating ${updatedCarParks.length} carparks in database`);
            
            if (updatedCarParks.length > 0) {
                await carParkRepository.updateMany(updatedCarParks);
                console.log("Database update completed successfully");
            } else {
                console.log("No carparks to update");
            }
            
            return;
        } catch (error) {
            console.error("Error in processData:", error);
            throw error; // Re-throw to be handled by the calling code
        }
    }
}