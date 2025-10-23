#!/bin/bash
cd /Users/robertgateno/Desktop/CORNELLFA25/HYPERIMAGE/tburger.github.io

# Convert unit plans
sips -s format png IMAGES/studioPlan.pdf --out IMAGES/studioPlan.png
sips -s format png IMAGES/1bedPlan.pdf --out IMAGES/1bedPlan.png
sips -s format png IMAGES/2bedPlan.pdf --out IMAGES/2bedPlan.png
sips -s format png IMAGES/3bedPlan.pdf --out IMAGES/3bedPlan.png

# Convert assets
sips -s format png IMAGES/eventCenter.pdf --out IMAGES/eventCenter.png
sips -s format png IMAGES/primarySchool.pdf --out IMAGES/primarySchool.png
sips -s format png IMAGES/specialEducation.pdf --out IMAGES/specialEducation.png
sips -s format png IMAGES/childhoodCare.pdf --out IMAGES/childhoodCare.png
sips -s format png IMAGES/groceryStore.pdf --out IMAGES/groceryStore.png
sips -s format png IMAGES/resourceLab.pdf --out IMAGES/resourceLab.png

echo "Conversion complete!"
