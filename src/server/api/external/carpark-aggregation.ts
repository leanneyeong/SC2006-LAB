import { TRPCError } from "@trpc/server";
import { HousingDevelopmentBoard } from "./hdb";
import { LandTransportAuthority } from "./lta";
import { UrbanRedevelopmentAuthority } from "./ura";

export interface StandardizedCarParkData {
    id: string;
    lotType: string;
    totalLots: number | null;
    availableLots: number;
    agency: string;
    location?: string;
    coordinates?: string;
    area?: string;
    development?: string;
    lastUpdated: Date;
}

export class CarparkAggregationService {
    private hdbService: HousingDevelopmentBoard;
    private ltaService: LandTransportAuthority;
    private uraService: UrbanRedevelopmentAuthority;

    constructor() {
        this.hdbService = new HousingDevelopmentBoard();
        this.ltaService = new LandTransportAuthority();
        this.uraService = new UrbanRedevelopmentAuthority();
    }

    public async initialize(): Promise<void> {
        await Promise.all([
            this.hdbService.initialize(),
            this.ltaService.initialize(),
            this.uraService.initialize()
        ]);
    }

    /**
     * Gets carpark availability data from all providers
     * and returns it in a standardized format
     */
    public async getAllCarparkAvailability(): Promise<StandardizedCarParkData[]> {
        try {
            // Use Promise.allSettled to continue even if one API fails
            const [hdbResult, ltaResult, uraResult] = await Promise.allSettled([
                this.getHDBCarparks(),
                this.getLTACarparks(),
                this.getURACarparks()
            ]);

            // Combine results from successful API calls
            const allCarparks: StandardizedCarParkData[] = [];
            
            if (hdbResult.status === 'fulfilled') allCarparks.push(...hdbResult.value);
            if (ltaResult.status === 'fulfilled') allCarparks.push(...ltaResult.value);
            if (uraResult.status === 'fulfilled') allCarparks.push(...uraResult.value);

            return allCarparks;
        } catch (err) {
            if (err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: e.message
            });
        }
    }

    /**
     * Gets carpark availability data from the HDB API
     */
    public async getHDBCarparks(): Promise<StandardizedCarParkData[]> {
        try {
            const carparkData = await this.hdbService.getCarParkAvailability();
            return this.hdbService.transformCarParkData(carparkData) as StandardizedCarParkData[];
        } catch (err) {
            console.error("Failed to get HDB carpark data:", err);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to get HDB carpark data"
            });
        }
    }

    /**
     * Gets carpark availability data from the LTA API
     */
    public async getLTACarparks(): Promise<StandardizedCarParkData[]> {
        try {
            const carparkData = await this.ltaService.getCarParkAvailability();
            return this.ltaService.transformCarParkData(carparkData) as StandardizedCarParkData[];
        } catch (err) {
            console.error("Failed to get LTA carpark data:", err);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to get LTA carpark data"
            });
        }
    }

    /**
     * Gets carpark availability data from the URA API
     */
    public async getURACarparks(): Promise<StandardizedCarParkData[]> {
        try {
            const carparkData = await this.uraService.getCarParkAvailability();
            return this.uraService.transformCarParkData(carparkData) as StandardizedCarParkData[];
        } catch (err) {
            console.error("Failed to get URA carpark data:", err);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to get URA carpark data"
            });
        }
    }
}