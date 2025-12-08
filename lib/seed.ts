import { addMotorPolicy, addHealthPolicy, addCommercialPolicy } from '@/lib/db';
import { MotorPolicy, HealthPolicy, CommercialPolicy } from '@/types';

const MANUFACTURERS = ['Maruti Suzuki', 'Hyundai', 'Tata Motors', 'Mahindra', 'Honda', 'Toyota'];
const MODELS = ['Swift', 'Creta', 'Nexon', 'Thar', 'City', 'Fortuner'];
const INSURERS = ['HDFC Ergo', 'ICICI Lombard', 'Bajaj Allianz', 'Tata AIG', 'Star Health', 'Niva Bupa'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad'];

function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function seedUserData(userId: string) {

    // Seed Motor Policies (1-3)
    const motorCount = randomNumber(1, 3);
    for (let i = 0; i < motorCount; i++) {
        const startDate = randomDate(new Date(2023, 0, 1), new Date());
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);

        await addMotorPolicy({
            user_id: userId,
            policy_number: `MOT-${randomNumber(100000, 999999)}`,
            vehicle_number: `MH-${randomNumber(10, 99)}-${String.fromCharCode(65 + randomNumber(0, 25))}${String.fromCharCode(65 + randomNumber(0, 25))}-${randomNumber(1000, 9999)}`,
            vehicle_type: 'Car',
            manufacturer: randomItem(MANUFACTURERS),
            model: randomItem(MODELS),
            fuel_type: randomItem(['Petrol', 'Diesel', 'CNG']),
            manufacturing_year: randomNumber(2015, 2024),
            number_plate_type: 'White',
            insurer_name: randomItem(INSURERS),
            premium_amount: randomNumber(5000, 25000),
            policy_start_date: startDate,
            policy_end_date: endDate,
            rc_docs: [],
            previous_policy_docs: [],
            dl_docs: [],
            status: 'Active' // Will be recalculated by db/utils logic usually, but setting default
        } as any);
    }

    // Seed Health Policies (1-3)
    const healthCount = randomNumber(1, 3);
    for (let i = 0; i < healthCount; i++) {
        const expiryDate = randomDate(new Date(), new Date(2025, 11, 31));

        await addHealthPolicy({
            user_id: userId,
            policy_number: `HLT-${randomNumber(100000, 999999)}`,
            insurer_name: randomItem(INSURERS),
            sum_insured: randomNumber(500000, 5000000),
            premium_amount: randomNumber(10000, 50000),
            expiry_date: expiryDate,
            policy_docs: [],
            no_of_lives: randomNumber(1, 4),
            company_name: '',
            status: 'Active'
        } as any);
    }

    // Seed Commercial Policies (1-2)
    const commCount = randomNumber(1, 2);
    for (let i = 0; i < commCount; i++) {
        const expiryDate = randomDate(new Date(), new Date(2025, 11, 31));

        await addCommercialPolicy({
            user_id: userId,
            lob_type: randomItem(['GPA', 'Fire', 'Other']),
            policy_number: `COM-${randomNumber(100000, 999999)}`,
            insurer_name: randomItem(INSURERS),
            premium_amount: randomNumber(15000, 100000),
            sum_insured: randomNumber(1000000, 10000000),
            expiry_date: expiryDate,
            policy_docs: [],
            company_name: 'My Business Inc',
            policy_holder_name: 'John Doe',
            status: 'Active'
        } as any);
    }

}
