#!/bin/bash

echo "Starting MuuuSmart Frontend..."
echo "Installing dependencies..."
npm install

echo "Building the application..."
npm run build

echo "Starting the preview server..."
echo "Application will be available at http://localhost:4173"
npm run preview