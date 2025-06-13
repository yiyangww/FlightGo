-- CreateEnum
CREATE TYPE "gender_type" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "role_type" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "seat_status_type" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'BOOKED');

-- CreateTable
CREATE TABLE "airline" (
    "code" CHAR(2) NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "airline_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "airport" (
    "code" CHAR(3) NOT NULL,
    "city" VARCHAR(255) NOT NULL,

    CONSTRAINT "airport_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "aircraft" (
    "id" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "aircraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route" (
    "flight_number" INTEGER NOT NULL,
    "airline_code" CHAR(2) NOT NULL,
    "departure_airport" CHAR(3) NOT NULL,
    "destination_airport" CHAR(3) NOT NULL,
    "departure_time" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "aircraft_id" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,

    CONSTRAINT "route_pkey" PRIMARY KEY ("flight_number","airline_code")
);

-- CreateTable
CREATE TABLE "flight" (
    "id" SERIAL NOT NULL,
    "flight_number" INTEGER NOT NULL,
    "airline_code" CHAR(2) NOT NULL,
    "date" DATE NOT NULL,
    "available_tickets" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "flight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "role_type" NOT NULL DEFAULT 'USER',
    "googleId" TEXT,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passenger" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "birth_date" DATE NOT NULL,
    "gender" "gender_type" NOT NULL,
    "address" VARCHAR(255),
    "phone_number" VARCHAR(255),
    "account_id" INTEGER NOT NULL,

    CONSTRAINT "passenger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seat_info" (
    "flight_id" INTEGER NOT NULL,
    "seat_number" INTEGER NOT NULL,
    "seat_status" "seat_status_type" NOT NULL DEFAULT 'AVAILABLE',
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "seat_info_pkey" PRIMARY KEY ("flight_id","seat_number")
);

-- CreateTable
CREATE TABLE "ticket" (
    "id" SERIAL NOT NULL,
    "passenger_id" INTEGER NOT NULL,
    "flight_id" INTEGER NOT NULL,
    "seat_number" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "flight_flight_number_airline_code_date_key" ON "flight"("flight_number", "airline_code", "date");

-- CreateIndex
CREATE UNIQUE INDEX "account_username_key" ON "account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "account_googleId_key" ON "account"("googleId");

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_airline_code_fkey" FOREIGN KEY ("airline_code") REFERENCES "airline"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_aircraft_id_fkey" FOREIGN KEY ("aircraft_id") REFERENCES "aircraft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_departure_airport_fkey" FOREIGN KEY ("departure_airport") REFERENCES "airport"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route" ADD CONSTRAINT "route_destination_airport_fkey" FOREIGN KEY ("destination_airport") REFERENCES "airport"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_flight_number_airline_code_fkey" FOREIGN KEY ("flight_number", "airline_code") REFERENCES "route"("flight_number", "airline_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight" ADD CONSTRAINT "flight_airline_code_fkey" FOREIGN KEY ("airline_code") REFERENCES "airline"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passenger" ADD CONSTRAINT "passenger_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_info" ADD CONSTRAINT "seat_info_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_passenger_id_fkey" FOREIGN KEY ("passenger_id") REFERENCES "passenger"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_flight_id_fkey" FOREIGN KEY ("flight_id") REFERENCES "flight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_flight_id_seat_number_fkey" FOREIGN KEY ("flight_id", "seat_number") REFERENCES "seat_info"("flight_id", "seat_number") ON DELETE RESTRICT ON UPDATE CASCADE;
