import { supabase } from '@/integrations/supabase/client';

// Convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};

export const extractTextFromImage = async (imageFile: File): Promise<string> => {
  try {
    console.log('🚀 Starting OCR extraction with OpenAI Vision...');
    
    // Convert image to base64
    const imageBase64 = await fileToBase64(imageFile);
    
    // Try OpenAI first
    try {
      const { data, error } = await supabase.functions.invoke('openai-ocr', {
        body: { imageBase64 }
      });
      
      if (!error && data?.text) {
        console.log('✅ OpenAI OCR extraction completed:', data.text.length, 'characters');
        return data.text;
      }
      
      console.warn('⚠️ OpenAI OCR failed, falling back to Tesseract:', error?.message);
    } catch (openaiError) {
      console.warn('⚠️ OpenAI OCR failed, falling back to Tesseract:', openaiError);
    }
    
    // Fallback to Tesseract OCR
    console.log('🔄 Using Tesseract OCR fallback...');
    const { extractTextWithMultiOCR, getBestOCRResult } = await import('./multiOcrService');
    
    const results = await extractTextWithMultiOCR(imageFile, {
      enableTesseract: true,
      enableCanvasOCR: true,
      enablePaddleOCR: false,
      enableAdvancedPreprocessing: true,
      preferredEngine: 'auto'
    });
    
    const text = getBestOCRResult(results);
    
    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the image');
    }
    
    console.log('✅ Tesseract OCR extraction completed:', text.length, 'characters');
    return text;
    
  } catch (error) {
    console.error('❌ OCR extraction failed:', error);
    throw new Error(`OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const extractTrackmanData = async (imageFile: File) => {
  try {
    console.log('🔍 Starting TrackMan data extraction...');
    
    // Extract text using our OCR service (with fallback)
    const extractedText = await extractTextFromImage(imageFile);
    
    // Parse the extracted text to get structured TrackMan data
    const extractedData = parseTrackmanText(extractedText);
    
    console.log(`✅ Successfully extracted ${Object.keys(extractedData).length} data points`);
    return extractedData;
    
  } catch (error) {
    console.error('❌ TrackMan data extraction failed:', error);
    throw error;
  }
};

export const extractMultipleTrackmanData = async (imageFiles: File[]) => {
  try {
    console.log('🔍 Starting OCR processing for', imageFiles.length, 'files');
    
    const results = await Promise.all(
      imageFiles.map(async (file, index) => {
        console.log(`📁 Processing file ${index + 1}: ${file.name}`);
        
        const data = await extractTrackmanData(file);
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
  console.log('📝 Text length:', text.length, 'characters');
  const data: any = {};
  
  // Clean and normalize text for better pattern matching
  const cleanText = text.replace(/[^\w\s\-\.\'\"\|\:°]/g, ' ').replace(/\s+/g, ' ');
  console.log('🧹 Cleaned text sample:', cleanText.substring(0, 200));
  
  // Enhanced patterns with OCR error handling and flexible matching
  const patterns = {
    // Club data patterns - handle OCR misreads (O vs 0, l vs 1, etc.)
    clubSpeed: [
      /(?:CLUB[_\s]*SPEED|CLUBSPEED)[:\s|]*([0O1l]?\d+\.?\d*)[_\s]*(?:mph|MPH|mp[hl])/i,
      /CLUB[_\s]+(\d+\.?\d*)[_\s]*(?:mph|MPH)/i,
      /(?:CL[UO]B|CLUB)[_\s]*(\d+\.?\d*)[_\s]*MPH/i
    ],
    attackAngle: [
      /(?:ATTACK[_\s]*(?:ANG|ANGLE)|ATT[_\s]*ANG)[:\s|]*(-?\d+\.?\d*)[_\s]*(?:deg|DEG|°|d[e3]g)/i,
      /ATTACK[_\s]+(-?\d+\.?\d*)[_\s]*(?:deg|DEG)/i
    ],
    clubPath: [
      /(?:CLUB[_\s]*PATH|CLUBPATH)[:\s|]*(-?\d+\.?\d*)[_\s]*(?:deg|DEG|°)/i,
      /PATH[_\s]+(-?\d+\.?\d*)[_\s]*(?:deg|DEG)/i
    ],
    dynLoft: [
      /(?:DYN[_\.\s]*LOFT|DYNAMIC[_\s]*LOFT|DYN[_\s]*L[O0]FT)[:\s|]*(\d+\.?\d*)[_\s]*(?:deg|DEG|°)/i,
      /DYN[_\s]+(\d+\.?\d*)[_\s]*(?:deg|DEG)/i
    ],
    faceAngle: [
      /(?:FACE[_\s]*(?:ANG|ANGLE)|F[A4]CE[_\s]*ANG)[:\s|]*(-?\d+\.?\d*)[_\s]*(?:deg|DEG|°)/i,
      /FACE[_\s]+(-?\d+\.?\d*)[_\s]*(?:deg|DEG)/i
    ],
    spinLoft: [
      /(?:SPIN[_\s]*LOFT|SPINLOFT)[:\s|]*(\d+\.?\d*)[_\s]*(?:deg|DEG|°)/i,
      /SPIN[_\s]+(\d+\.?\d*)[_\s]*(?:deg|DEG)/i
    ],
    faceToPath: [
      /(?:FACE[_\s]*TO[_\s]*PATH|FACETOPATH|F[A4]CE[_\s]*T[O0][_\s]*PATH)[:\s|]*(-?\d+\.?\d*)[_\s]*(?:deg|DEG|°)/i,
      /F[A4]CE[_\s]*T[O0][_\s]*PATH[_\s]+(-?\d+\.?\d*)/i
    ],
    swingPlane: [
      /(?:SWING[_\s]*(?:PL|PLANE)|SW[I1]NG[_\s]*PL)[:\s|]*(\d+\.?\d*)[_\s]*(?:deg|DEG|°)/i,
      /SWING[_\s]+(\d+\.?\d*)[_\s]*(?:deg|DEG)/i
    ],
    swingDirection: [
      /(?:SWING[_\s]*(?:DIR|DIRECTION)|SW[I1]NG[_\s]*D[I1]R)[:\s|]*(-?\d+\.?\d*)[_\s]*(?:deg|DEG|°)/i,
      /SWING[_\s]*DIR[_\s]+(-?\d+\.?\d*)/i
    ],
    lowPointDistance: [
      /(?:LOW[_\s]*PT[_\s]*(?:DIST|DISTANCE)|L[O0]W[_\s]*P[O0]INT)[:\s|]*(\d+\.?\d*A?)[_\s]*(?:in|IN|i[nl])/i,
      /L[O0]W[_\s]*PT[_\s]+(\d+\.?\d*A?)/i
    ],
    impactOffset: [
      /(?:IMP[_\.\s]*OFFSET|IMPACT[_\s]*OFFSET|[I1]MP[_\s]*[O0]FFSET)[:\s|]*(-?\d+)[_\s]*(?:mm|MM)/i,
      /(?:IMP|IMPACT)[_\s]+(-?\d+)[_\s]*mm/i
    ],
    impactHeight: [
      /(?:IMP[_\.\s]*HEIGHT|IMPACT[_\s]*HEIGHT|[I1]MP[_\s]*HE[I1]GHT)[:\s|]*(-?\d+)[_\s]*(?:mm|MM)/i,
      /(?:IMP|IMPACT)[_\s]*HEIGHT[_\s]+(-?\d+)/i
    ],
    dynLie: [
      /(?:DYN[_\.\s]*LIE|DYNAMIC[_\s]*LIE|DYN[_\s]*L[I1]E)[:\s|]*(\d+\.?\d*)[_\s]*(?:deg|DEG|°)/i,
      /DYN[_\s]*LIE[_\s]+(\d+\.?\d*)/i
    ],
    
    // Ball data patterns with OCR error handling
    ballSpeed: [
      /(?:BALL[_\s]*SPEED|B[A4]LL[_\s]*SPEED|BALLSPEED)[:\s|]*([01l]?\d+\.?\d*)[_\s]*(?:mph|MPH|mp[hl])/i,
      /BALL[_\s]+(\d+\.?\d*)[_\s]*(?:mph|MPH)/i
    ],
    smashFactor: [
      /(?:SMASH[_\s]*(?:FAC|FACTOR)|SM[A4]SH[_\s]*F[A4]C)[:\s|]*([01l]\.?\d*)/i,
      /SMASH[_\s]+([01l]\.?\d*)/i
    ],
    launchAngle: [
      /(?:LAUNCH[_\s]*(?:ANG|ANGLE)|L[A4]UNCH[_\s]*ANG)[:\s|]*(\d+\.?\d*)[_\s]*(?:deg|DEG|°)/i,
      /LAUNCH[_\s]+(\d+\.?\d*)[_\s]*(?:deg|DEG)/i
    ],
    launchDirection: [
      /(?:LAUNCH[_\s]*(?:DIR|DIRECTION)|L[A4]UNCH[_\s]*D[I1]R)[:\s|]*(-?\d+\.?\d*)[_\s]*(?:deg|DEG|°)/i,
      /LAUNCH[_\s]*DIR[_\s]+(-?\d+\.?\d*)/i
    ],
    spinRate: [
      /(?:SPIN[_\s]*RATE|SP[I1]N[_\s]*R[A4]TE|SPINRATE)[:\s|]*(\d+)[_\s]*(?:rpm|RPM|rp[ml])/i,
      /SPIN[_\s]*RATE[_\s]+(\d+)/i,
      /(\d{4,5})[_\s]*(?:rpm|RPM)/i
    ],
    spinAxis: [
      /(?:SPIN[_\s]*AXIS|SP[I1]N[_\s]*[A4]X[I1]S|SPINAXIS)[:\s|]*(\d+\.?\d*)[_\s]*(?:deg|DEG|°)/i,
      /SPIN[_\s]*AXIS[_\s]+(\d+\.?\d*)/i
    ],
    
    // Flight data patterns with OCR variations
    curve: [
      /(?:CURVE|CURV[E3])[:\s|]*(\d+R?)[_\s]*(?:ft|FT|f[tl])/i,
      /CURVE[_\s]+(\d+R?)/i
    ],
    height: [
      /(?:HEIGHT|HE[I1]GHT)[:\s|]*(\d+)[_\s]*(?:ft|FT|f[tl])/i,
      /HEIGHT[_\s]+(\d+)/i,
      /\|[_\s]*(\d{2,3})[_\s]*\|/  // Table format like |63|
    ],
    carry: [
      /(?:CARRY|C[A4]RRY)[:\s|]*(\d+\.?\d*)[_\s]*(?:yds|YDS|yards|y[a4]rds)/i,
      /CARRY[_\s]+(\d+\.?\d*)/i
    ],
    total: [
      /(?:TOTAL|T[O0]T[A4]L)[:\s|]*(\d+\.?\d*)[_\s]*(?:yds|YDS|yards)/i,
      /TOTAL[_\s]+(\d+\.?\d*)/i
    ],
    side: [
      /(?:SIDE)[:\s|]*(\d+'\s*\d+"?R?)/i,
      /SIDE[_\s]+(\d+['\s]*\d+"?R?)/i
    ],
    sideTotal: [
      /(?:SIDE[_\s]*(?:TOT|TOTAL)|S[I1]DE[_\s]*T[O0]T)[:\s|]*(\d+'\s*\d+"?R?)/i,
      /SIDE[_\s]*TOTAL[_\s]+(\d+['\s]*\d+"?R?)/i
    ],
    landingAngle: [
      /(?:LAND[_\.\s]*(?:ANG|ANGLE)|LANDING[_\s]*(?:ANG|ANGLE)|L[A4]ND[_\s]*ANG)[:\s|]*(\d+\.?\d*)[_\s]*(?:deg|DEG|°)/i,
      /LANDING[_\s]*ANGLE[_\s]+(\d+\.?\d*)/i
    ],
    hangTime: [
      /(?:HANG[_\s]*TIME|H[A4]NG[_\s]*T[I1]ME|HANGTIME)[:\s|]*(\d+\.?\d*)[_\s]*(?:s|sec|S[E3]C)/i,
      /HANG[_\s]*TIME[_\s]+(\d+\.?\d*)/i
    ],
    lastData: [
      /(?:LAST[_\s]*DATA|L[A4]ST[_\s]*D[A4]T[A4]|LASTDATA)[:\s|]*(\d+\.?\d*)[_\s]*(?:yds|YDS|yards)/i,
      /LAST[_\s]*DATA[_\s]+(\d+\.?\d*)/i
    ]
  };
  
  // Extract data using multiple approaches for maximum coverage
  let matchCount = 0;
  
  // Try multiple pattern variations for each data point
  for (const [key, patternArray] of Object.entries(patterns)) {
    let matched = false;
    
    for (const pattern of patternArray) {
      const match = text.match(pattern) || cleanText.match(pattern);
      if (match && match[1]) {
        let value = match[1];
        
        // Clean up OCR errors in numbers
        value = value.replace(/[Oo]/g, '0').replace(/[Il]/g, '1').replace(/[S]/g, '5');
        
        // Handle special cases
        if (key === 'spinRate' && value.length === 3) {
          // If we got something like "468" it might be "4686" with missing digit
          const possibleFullNumber = text.match(new RegExp(value + '\\d'));
          if (possibleFullNumber) value = possibleFullNumber[0];
        }
        
        // Handle decimal point corrections for specific measurements
        if (['clubSpeed', 'ballSpeed'].includes(key) && !value.includes('.') && value.length >= 3) {
          // Convert "845" to "84.5", "1181" to "118.1"
          value = value.slice(0, -1) + '.' + value.slice(-1);
        }
        
        data[key] = value;
        matchCount++;
        matched = true;
        console.log(`✅ Pattern match for ${key}: ${value}`);
        break;
      }
    }
    
    if (!matched) {
      console.log(`❌ No match found for ${key}`);
    }
  }
  
  // Add units to the extracted values for clarity
  if (data.clubSpeed) data.clubSpeed += " mph";
  if (data.ballSpeed) data.ballSpeed += " mph";
  if (data.attackAngle) data.attackAngle += " deg";
  if (data.clubPath) data.clubPath += " deg";
  if (data.dynLoft) data.dynLoft += " deg";
  if (data.faceAngle) data.faceAngle += " deg";
  if (data.spinLoft) data.spinLoft += " deg";
  if (data.faceToPath) data.faceToPath += " deg";
  if (data.swingPlane) data.swingPlane += " deg";
  if (data.swingDirection) data.swingDirection += " deg";
  if (data.dynLie) data.dynLie += " deg";
  if (data.launchAngle) data.launchAngle += " deg";
  if (data.launchDirection) data.launchDirection += " deg";
  if (data.landingAngle) data.landingAngle += " deg";
  if (data.spinRate) data.spinRate += " rpm";
  if (data.spinAxis) data.spinAxis += " deg";
  if (data.height) data.height += " ft";
  if (data.curve) data.curve += " ft";
  if (data.carry) data.carry += " yds";
  if (data.total) data.total += " yds";
  if (data.lastData) data.lastData += " yds";
  if (data.lowPointDistance) data.lowPointDistance += " in";
  if (data.impactOffset) data.impactOffset += " mm";
  if (data.impactHeight) data.impactHeight += " mm";
  if (data.hangTime) data.hangTime += " s";
  
  console.log(`📊 Total matches found: ${matchCount}`);
  console.log('🔍 Final extracted data:', data);

  return data;
};