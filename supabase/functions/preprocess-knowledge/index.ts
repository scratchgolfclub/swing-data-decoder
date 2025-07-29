import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Estimate tokens (rough approximation: ~4 characters per token)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Generate embedding using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Parse knowledge base metrics
function parseKnowledgeBase(content: string) {
  const entries: any[] = [];
  const sections = content.split('###').filter(Boolean);
  
  for (const section of sections) {
    const lines = section.trim().split('\n').filter(Boolean);
    if (lines.length === 0) continue;
    
    const title = lines[0].replace(/^#+\s*/, '').trim();
    if (!title || title.toLowerCase().includes('knowledge base')) continue;
    
    let unit = '';
    let description = '';
    let goodRanges = '';
    let drillsLow = '';
    let drillsHigh = '';
    let feelsLow = '';
    let feelsHigh = '';
    
    let currentSection = '';
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('- **Unit:**')) {
        unit = line.replace('- **Unit:**', '').trim();
      } else if (line.startsWith('- **Description:**')) {
        description = line.replace('- **Description:**', '').trim();
        currentSection = 'description';
      } else if (line.startsWith('- **Good Ranges:**')) {
        currentSection = 'ranges';
      } else if (line.startsWith('- **Drills if Too Low:**')) {
        currentSection = 'drillsLow';
      } else if (line.startsWith('- **Drills if Too High:**')) {
        currentSection = 'drillsHigh';
      } else if (line.startsWith('- **Feels if Too Low:**')) {
        currentSection = 'feelsLow';
      } else if (line.startsWith('- **Feels if Too High:**')) {
        currentSection = 'feelsHigh';
      } else if (line.startsWith('- **') || line.startsWith('###')) {
        currentSection = '';
      } else if (line && currentSection) {
        switch (currentSection) {
          case 'description':
            description += ' ' + line;
            break;
          case 'ranges':
            goodRanges += ' ' + line;
            break;
          case 'drillsLow':
            drillsLow += ' ' + line;
            break;
          case 'drillsHigh':
            drillsHigh += ' ' + line;
            break;
          case 'feelsLow':
            feelsLow += ' ' + line;
            break;
          case 'feelsHigh':
            feelsHigh += ' ' + line;
            break;
        }
      }
    }
    
    // Create flattened content
    const contentParts = [
      `Metric: ${title}`,
      unit ? `Unit: ${unit}` : '',
      description ? `Description: ${description}` : '',
      goodRanges ? `Good Ranges: ${goodRanges}` : '',
      drillsLow ? `Drills if Too Low: ${drillsLow}` : '',
      drillsHigh ? `Drills if Too High: ${drillsHigh}` : '',
      feelsLow ? `Feels if Too Low: ${feelsLow}` : '',
      feelsHigh ? `Feels if Too High: ${feelsHigh}` : ''
    ].filter(Boolean);
    
    entries.push({
      title,
      type: 'metric',
      content: contentParts.join('\n'),
      trigger_metrics: [title],
      metadata: {
        unit,
        good_ranges: goodRanges.trim(),
        drills_low: drillsLow.trim(),
        drills_high: drillsHigh.trim(),
        feels_low: feelsLow.trim(),
        feels_high: feelsHigh.trim()
      }
    });
  }
  
  return entries;
}

// Parse swing faults
function parseSwingFaults(content: string) {
  const entries: any[] = [];
  const sections = content.split('###').filter(Boolean);
  
  for (const section of sections) {
    const lines = section.trim().split('\n').filter(Boolean);
    if (lines.length === 0) continue;
    
    const title = lines[0].replace(/^#+\s*/, '').trim();
    if (!title || title.toLowerCase().includes('swing faults')) continue;
    
    let description = '';
    let triggerMetrics: string[] = [];
    let drills = '';
    let feels = '';
    
    let currentSection = '';
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('- **Description:**')) {
        description = line.replace('- **Description:**', '').trim();
        currentSection = 'description';
      } else if (line.startsWith('- **Trigger Metrics:**')) {
        currentSection = 'triggers';
      } else if (line.startsWith('- **Drills:**')) {
        currentSection = 'drills';
      } else if (line.startsWith('- **Feels:**')) {
        currentSection = 'feels';
      } else if (line.startsWith('- **') || line.startsWith('###')) {
        currentSection = '';
      } else if (line && currentSection) {
        switch (currentSection) {
          case 'description':
            description += ' ' + line;
            break;
          case 'triggers':
            // Extract metric names from trigger conditions
            const metricMatches = line.matchAll(/"([^"]+)"/g);
            for (const match of metricMatches) {
              const metric = match[1];
              if (!triggerMetrics.includes(metric)) {
                triggerMetrics.push(metric);
              }
            }
            break;
          case 'drills':
            drills += ' ' + line;
            break;
          case 'feels':
            feels += ' ' + line;
            break;
        }
      }
    }
    
    // Create flattened content
    const contentParts = [
      `Fault: ${title}`,
      description ? `Description: ${description}` : '',
      triggerMetrics.length ? `Trigger Metrics: ${triggerMetrics.join(', ')}` : '',
      drills ? `Drills: ${drills}` : '',
      feels ? `Feels: ${feels}` : ''
    ].filter(Boolean);
    
    entries.push({
      title,
      type: 'fault',
      content: contentParts.join('\n'),
      trigger_metrics: triggerMetrics,
      metadata: {
        description: description.trim(),
        drills: drills.trim(),
        feels: feels.trim()
      }
    });
  }
  
  return entries;
}

// Parse video library
function parseVideoLibrary(content: string) {
  const entries: any[] = [];
  const sections = content.split('###').filter(Boolean);
  
  for (const section of sections) {
    const lines = section.trim().split('\n').filter(Boolean);
    if (lines.length === 0) continue;
    
    const title = lines[0].trim();
    if (!title || title.includes('Video Library')) continue;
    
    let url = '';
    let triggerMetrics: string[] = [];
    let recommendationReason = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('- **URL:**')) {
        const urlMatch = line.match(/\[.*?\]\((https:\/\/[^\)]+)\)/);
        if (urlMatch) {
          url = urlMatch[1];
        }
      } else if (line.startsWith('- **Trigger Metrics:**')) {
        const metricsMatch = line.match(/\[(.*?)\]/);
        if (metricsMatch) {
          const metricsStr = metricsMatch[1];
          triggerMetrics = metricsStr.split(',').map(m => m.trim().replace(/"/g, ''));
        }
      } else if (line.startsWith('- **Recommendation Reason:**')) {
        recommendationReason = line.replace('- **Recommendation Reason:**', '').trim();
      }
    }
    
    if (!url) continue;
    
    // Create flattened content
    const contentParts = [
      `Video: ${title}`,
      url ? `URL: ${url}` : '',
      triggerMetrics.length ? `Trigger Metrics: ${triggerMetrics.join(', ')}` : '',
      recommendationReason ? `Recommendation: ${recommendationReason}` : ''
    ].filter(Boolean);
    
    entries.push({
      title,
      type: 'video',
      content: contentParts.join('\n'),
      trigger_metrics: triggerMetrics,
      metadata: {
        url,
        recommendation_reason: recommendationReason
      }
    });
  }
  
  return entries;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting intelligent knowledge preprocessing...');
    
    // Clear existing embeddings
    console.log('Clearing existing embeddings...');
    const { error: clearError } = await supabase
      .from('embedding_documents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (clearError) {
      console.error('Error clearing embeddings:', clearError);
      throw clearError;
    }

    // Read markdown files directly from the file system
    console.log('Reading markdown files from file system...');
    
    const markdownContent: { [key: string]: string } = {};
    
    try {
      // Read knowledgeBase.md
      markdownContent['knowledgeBase.md'] = await Deno.readTextFile('./markdown/knowledgeBase.md');
      console.log('Successfully read knowledgeBase.md');
    } catch (error) {
      console.error('Error reading knowledgeBase.md:', error);
      throw new Error('Failed to read knowledgeBase.md file');
    }
    
    try {
      // Read swingFaults_clean.md
      markdownContent['swingFaults_clean.md'] = await Deno.readTextFile('./markdown/swingFaults_clean.md');
      console.log('Successfully read swingFaults_clean.md');
    } catch (error) {
      console.error('Error reading swingFaults_clean.md:', error);
      throw new Error('Failed to read swingFaults_clean.md file');
    }
    
    try {
      // Read videoLibrary.md
      markdownContent['videoLibrary.md'] = await Deno.readTextFile('./markdown/videoLibrary.md');
      console.log('Successfully read videoLibrary.md');
    } catch (error) {
      console.error('Error reading videoLibrary.md:', error);
      throw new Error('Failed to read videoLibrary.md file');
    }

    // Knowledge base definitions with file paths
    const knowledgeBases = [
      {
        name: 'knowledgeBase.md',
        namespace: 'metrics',
        parser: parseKnowledgeBase
      },
      {
        name: 'swingFaults_clean.md', 
        namespace: 'faults',
        parser: parseSwingFaults
      },
      {
        name: 'videoLibrary.md',
        namespace: 'videos', 
        parser: parseVideoLibrary
      }
    ];

    let totalProcessed = 0;
    let totalFailed = 0;
    const typeStats = { metric: 0, fault: 0, video: 0 };

    for (const kb of knowledgeBases) {
      console.log(`Processing ${kb.name}...`);
      
      try {
        // Get the content from file system
        const content = markdownContent[kb.name];
        
        if (!content) {
          throw new Error(`Content not found for ${kb.name}`);
        }
        
        console.log(`Content length for ${kb.name}: ${content.length} characters`);
        
        // Parse the content
        const entries = kb.parser(content);
        console.log(`Parsed ${entries.length} entries from ${kb.name}`);
        
        // Process each entry
        for (const entry of entries) {
          try {
            console.log(`Processing ${entry.type}: ${entry.title}`);
            
            // Generate embedding
            const embedding = await generateEmbedding(entry.content);
            
            // Insert into database
            const { error: insertError } = await supabase
              .from('embedding_documents')
              .insert({
                namespace: kb.namespace,
                title: entry.title,
                type: entry.type,
                content: entry.content,
                trigger_metrics: entry.trigger_metrics,
                metadata: entry.metadata,
                embedding: embedding
              });
            
            if (insertError) {
              console.error(`Error inserting ${entry.title}:`, insertError);
              totalFailed++;
            } else {
              totalProcessed++;
              typeStats[entry.type as keyof typeof typeStats]++;
              console.log(`✓ Successfully processed: ${entry.title}`);
            }
            
          } catch (error) {
            console.error(`Error processing entry ${entry.title}:`, error);
            totalFailed++;
          }
        }
        
      } catch (error) {
        console.error(`Error processing ${kb.name}:`, error);
        totalFailed++;
      }
    }

    console.log('\n=== PROCESSING COMPLETE ===');
    console.log(`Total embeddings created: ${totalProcessed}`);
    console.log(`Total failed: ${totalFailed}`);
    console.log('Embeddings by type:');
    console.log(`- Metrics: ${typeStats.metric}`);
    console.log(`- Faults: ${typeStats.fault}`);
    console.log(`- Videos: ${typeStats.video}`);
    
    return new Response(JSON.stringify({
      success: true,
      stats: {
        totalFiles: knowledgeBases.length,
        totalChunks: totalProcessed + totalFailed,
        successfullyProcessed: totalProcessed,
        failedChunks: totalFailed,
        typeBreakdown: typeStats
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in preprocess-knowledge function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});