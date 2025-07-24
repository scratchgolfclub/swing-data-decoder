import Tesseract from 'tesseract.js';

export const extractTrackmanData = async (imageFile: File) => {
  try {
    console.log('🔍 Starting OCR processing for:', imageFile.name, 'Size:', imageFile.size);
    
    const { data: { text } } = await Tesseract.recognize(imageFile, 'eng', {
      logger: m => console.log('📊 OCR Progress:', m)
    });

    console.log('📝 Raw OCR Text Extracted:');
    console.log('='.repeat(50));
    console.log(text);
    console.log('='.repeat(50));

    // Parse the extracted text to find TrackMan data
    const data = parseTrackmanText(text, 1);
    return data;
  } catch (error) {
    console.error('❌ OCR Error:', error);
    throw error;
  }
};

export const extractMultipleTrackmanData = async (imageFiles: File[]) => {
  try {
    console.log('🔍 Starting OCR processing for', imageFiles.length, 'files');
    
    const results = await Promise.all(
      imageFiles.map(async (file, index) => {
        console.log(`📁 Processing file ${index + 1}: ${file.name}`);
        
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
          logger: m => console.log(`📊 File ${index + 1} OCR:`, m)
        });
        
        console.log(`📝 Raw OCR Text for file ${index + 1}:`);
        console.log('='.repeat(30));
        console.log(text);
        console.log('='.repeat(30));
        
        const data = parseTrackmanText(text, index + 1);
        return { ...data, swingNumber: index + 1 };
      })
    );
    
    return results;
  } catch (error) {
    console.error('❌ Multiple OCR Error:', error);
    throw error;
  }
};

const parseTrackmanText = (text: string, swingNumber: number = 1) => {
  console.log('🔍 Parsing TrackMan text for swing', swingNumber);
  const data: any = {};
  
  // Enhanced patterns with more flexible matching
  const patterns = {
    // Club data patterns - more flexible spacing and variations
    clubSpeed: /(?:CLUB\s*SPEED|CLUBSPEED)[:\s]*(\d+\.?\d*)\s*(?:mph|MPH)/i,
    attackAngle: /(?:ATTACK\s*ANG|ATTACK\s*ANGLE)[:\s]*(-?\d+\.?\d*)\s*(?:deg|DEG|°)/i,
    clubPath: /(?:CLUB\s*PATH|CLUBPATH)[:\s]*(-?\d+\.?\d*)\s*(?:deg|DEG|°)/i,
    dynLoft: /(?:DYN[\.\s]*LOFT|DYNAMIC\s*LOFT)[:\s]*(\d+\.?\d*)\s*(?:deg|DEG|°)/i,
    faceAngle: /(?:FACE\s*ANG|FACE\s*ANGLE)[:\s]*(-?\d+\.?\d*)\s*(?:deg|DEG|°)/i,
    spinLoft: /(?:SPIN\s*LOFT|SPINLOFT)[:\s]*(\d+\.?\d*)\s*(?:deg|DEG|°)/i,
    faceToPath: /(?:FACE\s*TO\s*PATH|FACETOPATH)[:\s]*(-?\d+\.?\d*)\s*(?:deg|DEG|°)/i,
    swingPlane: /(?:SWING\s*PL|SWING\s*PLANE)[:\s]*(\d+\.?\d*)\s*(?:deg|DEG|°)/i,
    swingDirection: /(?:SWING\s*DIR|SWING\s*DIRECTION)[:\s]*(-?\d+\.?\d*)\s*(?:deg|DEG|°)/i,
    lowPointDistance: /(?:LOW\s*PT\s*DIST|LOW\s*POINT)[:\s]*(\d+\.?\d*A?)\s*(?:in|IN)/i,
    impactOffset: /(?:IMP[\.\s]*OFFSET|IMPACT\s*OFFSET)[:\s]*(-?\d+)\s*(?:mm|MM)/i,
    impactHeight: /(?:IMP[\.\s]*HEIGHT|IMPACT\s*HEIGHT)[:\s]*(-?\d+)\s*(?:mm|MM)/i,
    dynLie: /(?:DYN[\.\s]*LIE|DYNAMIC\s*LIE)[:\s]*(\d+\.?\d*)\s*(?:deg|DEG|°)/i,
    
    // Ball data patterns
    ballSpeed: /(?:BALL\s*SPEED|BALLSPEED)[:\s]*(\d+\.?\d*)\s*(?:mph|MPH)/i,
    smashFactor: /(?:SMASH\s*FAC|SMASH\s*FACTOR)[:\s]*(\d+\.?\d*)/i,
    launchAngle: /(?:LAUNCH\s*ANG|LAUNCH\s*ANGLE)[:\s]*(\d+\.?\d*)\s*(?:deg|DEG|°)/i,
    launchDirection: /(?:LAUNCH\s*DIR|LAUNCH\s*DIRECTION)[:\s]*(-?\d+\.?\d*)\s*(?:deg|DEG|°)/i,
    spinRate: /(?:SPIN\s*RATE|SPINRATE)[:\s]*(\d+)\s*(?:rpm|RPM)/i,
    spinAxis: /(?:SPIN\s*AXIS|SPINAXIS)[:\s]*(\d+\.?\d*)\s*(?:deg|DEG|°)/i,
    
    // Flight data patterns
    curve: /(?:CURVE)[:\s]*(\d+R?)\s*(?:ft|FT)/i,
    height: /(?:HEIGHT)[:\s]*(\d+)\s*(?:ft|FT)/i,
    carry: /(?:CARRY)[:\s]*(\d+\.?\d*)\s*(?:yds|YDS|yards)/i,
    total: /(?:TOTAL)[:\s]*(\d+\.?\d*)\s*(?:yds|YDS|yards)/i,
    side: /(?:SIDE)[:\s]*(\d+'\s*\d+"?R?)/i,
    sideTotal: /(?:SIDE\s*TOT|SIDE\s*TOTAL)[:\s]*(\d+'\s*\d+"?R?)/i,
    landingAngle: /(?:LAND[\.\s]*ANG|LANDING\s*ANGLE)[:\s]*(\d+\.?\d*)\s*(?:deg|DEG|°)/i,
    hangTime: /(?:HANG\s*TIME|HANGTIME)[:\s]*(\d+\.?\d*)\s*(?:s|sec)/i,
    lastData: /(?:LAST\s*DATA|LASTDATA)[:\s]*(\d+\.?\d*)\s*(?:yds|YDS|yards)/i
  };

  // Extract data using patterns
  let matchCount = 0;
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = text.match(pattern);
    if (match) {
      data[key] = match[1];
      matchCount++;
      console.log(`✅ Found ${key}: ${match[1]}`);
    } else {
      console.log(`❌ No match for ${key}`);
    }
  }
  
  console.log(`📊 Total matches found: ${matchCount} out of ${Object.keys(patterns).length}`);
  console.log('🔍 Extracted data:', data);

  // Check if we have any meaningful data extracted
  if (Object.keys(data).length === 0) {
    console.warn('⚠️  No TrackMan data could be extracted from the image');
    console.log('💡 This might mean:');
    console.log('   - The image doesn\'t contain TrackMan data');
    console.log('   - The image quality is too low for OCR');
    console.log('   - The text format doesn\'t match expected patterns');
    
    // Return empty data with a flag indicating extraction failed
    return {
      extractionFailed: true,
      message: 'No TrackMan data could be extracted from this image',
      rawText: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
      suggestion: 'Please ensure the image shows a TrackMan screen with clear, readable text'
    };
  }

  // If we have some data but not much, still return it with a warning
  if (Object.keys(data).length < 3) {
    console.warn(`⚠️  Only ${Object.keys(data).length} data points extracted. Results may be incomplete.`);
    data.partialExtraction = true;
    data.extractedCount = Object.keys(data).length;
  } else {
    console.log(`✅ Successfully extracted ${Object.keys(data).length} data points`);
  }

  return data;
};