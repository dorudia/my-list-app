#!/bin/bash

# 1️⃣ Navighează în folderul proiectului
cd /Users/dorudia/Desktop/my-list-app/crud-app || exit

echo "📦 Ștergem node_modules și lock files..."
rm -rf node_modules
rm -f package-lock.json yarn.lock

echo "🧹 Ștergem folderele build Android și CMake..."
rm -rf android/app/build
rm -rf android/.gradle
rm -rf android/app/.cxx

echo "🔧 Reinstalăm dependențele JS..."
npm install  # sau 'yarn' dacă folosești yarn

# 2️⃣ (opțional) Reinstalează CocoaPods pentru iOS
if [ -d "ios" ]; then
  echo "💿 Reinstalăm pods iOS..."
  cd ios
  pod install
  cd ..
fi

echo "♻️ Curățăm build-ul Android..."
cd android || exit
./gradlew clean

echo "⚡ Rebuild Android debug pentru a genera fișierele native..."
./gradlew assembleDebug

echo "✅ Build curat complet. Acum poți încerca:"
echo "   eas build --platform android --profile production --local"
