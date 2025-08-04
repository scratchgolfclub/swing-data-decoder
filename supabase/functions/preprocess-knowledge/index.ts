import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { KNOWLEDGE_BASE_CONTENT, SWING_FAULTS_CONTENT, VIDEO_LIBRARY_CONTENT } from './markdown-content.ts';

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
  
  // Split by ### to get metric sections
  const sections = content.split(/^### /m).filter(section => section.trim().length > 0);
  
  for (const section of sections) {
    const lines = section.trim().split('\n');
    if (lines.length === 0) continue;
    
    const title = lines[0].trim();
    if (!title || title.toLowerCase().includes('knowledge base') || title.toLowerCase().includes('overview')) continue;
    
    console.log(`Parsing metric: ${title}`);
    
    let unit = '';
    let description = '';
    let goodRanges = [];
    let drillsLow = [];
    let drillsHigh = [];
    let feelsLow = [];
    let feelsHigh = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('- **Unit:**')) {
        unit = trimmedLine.replace('- **Unit:**', '').trim();
      } else if (trimmedLine.startsWith('- **Description:**')) {
        description = trimmedLine.replace('- **Description:**', '').trim();
      } else if (trimmedLine.startsWith('- **Good Ranges:**')) {
        // Extract JSON array from backticks
        const rangeMatch = trimmedLine.match(/`(\[.*?\])`/);
        if (rangeMatch) {
          try {
            goodRanges = JSON.parse(rangeMatch[1]);
          } catch (e) {
            console.warn(`Failed to parse ranges for ${title}:`, rangeMatch[1]);
          }
        }
      } else if (trimmedLine.startsWith('- **Drills if Too Low:**')) {
        const drillMatch = trimmedLine.match(/`(\[.*?\])`/);
        if (drillMatch) {
          try {
            drillsLow = JSON.parse(drillMatch[1]);
          } catch (e) {
            console.warn(`Failed to parse drills low for ${title}:`, drillMatch[1]);
          }
        }
      } else if (trimmedLine.startsWith('- **Drills if Too High:**')) {
        const drillMatch = trimmedLine.match(/`(\[.*?\])`/);
        if (drillMatch) {
          try {
            drillsHigh = JSON.parse(drillMatch[1]);
          } catch (e) {
            console.warn(`Failed to parse drills high for ${title}:`, drillMatch[1]);
          }
        }
      } else if (trimmedLine.startsWith('- **Feels if Too Low:**')) {
        const feelMatch = trimmedLine.match(/`(\[.*?\])`/);
        if (feelMatch) {
          try {
            feelsLow = JSON.parse(feelMatch[1]);
          } catch (e) {
            console.warn(`Failed to parse feels low for ${title}:`, feelMatch[1]);
          }
        }
      } else if (trimmedLine.startsWith('- **Feels if Too High:**')) {
        const feelMatch = trimmedLine.match(/`(\[.*?\])`/);
        if (feelMatch) {
          try {
            feelsHigh = JSON.parse(feelMatch[1]);
          } catch (e) {
            console.warn(`Failed to parse feels high for ${title}:`, feelMatch[1]);
          }
        }
      }
    }
    
    // Create flattened content
    const contentParts = [
      `Metric: ${title}`,
      unit ? `Unit: ${unit}` : '',
      description ? `Description: ${description}` : '',
      goodRanges.length ? `Good Ranges: ${goodRanges.join(', ')}` : '',
      drillsLow.length ? `Drills if Too Low: ${drillsLow.join(', ')}` : '',
      drillsHigh.length ? `Drills if Too High: ${drillsHigh.join(', ')}` : '',
      feelsLow.length ? `Feels if Too Low: ${feelsLow.join(', ')}` : '',
      feelsHigh.length ? `Feels if Too High: ${feelsHigh.join(', ')}` : ''
    ].filter(Boolean);
    
    entries.push({
      title,
      type: 'metric',
      content: contentParts.join('\n'),
      trigger_metrics: [title],
      metadata: {
        unit,
        good_ranges: goodRanges,
        drills_low: drillsLow,
        drills_high: drillsHigh,
        feels_low: feelsLow,
        feels_high: feelsHigh
      }
    });
  }
  
  console.log(`Found ${entries.length} metric entries`);
  return entries;
}

// Parse swing faults
function parseSwingFaults(content: string) {
  const entries: any[] = [];
  
  // Split by ### to get fault sections
  const sections = content.split(/^### /m).filter(section => section.trim().length > 0);
  
  for (const section of sections) {
    const lines = section.trim().split('\n');
    if (lines.length === 0) continue;
    
    const title = lines[0].trim();
    if (!title || title.toLowerCase().includes('swing faults') || title.toLowerCase().includes('overview')) continue;
    
    console.log(`Parsing fault: ${title}`);
    
    let description = '';
    let triggerMetrics: string[] = [];
    let drills = [];
    let feels = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('- **Description:**')) {
        description = trimmedLine.replace('- **Description:**', '').trim();
      } else if (trimmedLine.startsWith('- **Trigger Metrics:**')) {
        // Extract JSON array from backticks
        const triggerMatch = trimmedLine.match(/`(\[.*?\])`/);
        if (triggerMatch) {
          try {
            const triggerData = JSON.parse(triggerMatch[1]);
            // Extract metric names from trigger objects
            for (const trigger of triggerData) {
              if (trigger.metric && !triggerMetrics.includes(trigger.metric)) {
                triggerMetrics.push(trigger.metric);
              }
            }
          } catch (e) {
            console.warn(`Failed to parse trigger metrics for ${title}:`, triggerMatch[1]);
          }
        }
      } else if (trimmedLine.startsWith('- **Drills:**')) {
        const drillMatch = trimmedLine.match(/`(\[.*?\])`/);
        if (drillMatch) {
          try {
            drills = JSON.parse(drillMatch[1]);
          } catch (e) {
            console.warn(`Failed to parse drills for ${title}:`, drillMatch[1]);
          }
        }
      } else if (trimmedLine.startsWith('- **Feels:**')) {
        const feelMatch = trimmedLine.match(/`(\[.*?\])`/);
        if (feelMatch) {
          try {
            feels = JSON.parse(feelMatch[1]);
          } catch (e) {
            console.warn(`Failed to parse feels for ${title}:`, feelMatch[1]);
          }
        }
      }
    }
    
    // Create flattened content
    const contentParts = [
      `Fault: ${title}`,
      description ? `Description: ${description}` : '',
      triggerMetrics.length ? `Trigger Metrics: ${triggerMetrics.join(', ')}` : '',
      drills.length ? `Drills: ${drills.join(', ')}` : '',
      feels.length ? `Feels: ${feels.join(', ')}` : ''
    ].filter(Boolean);
    
    entries.push({
      title,
      type: 'fault',
      content: contentParts.join('\n'),
      trigger_metrics: triggerMetrics,
      metadata: {
        description: description.trim(),
        drills,
        feels
      }
    });
  }
  
  console.log(`Found ${entries.length} fault entries`);
  return entries;
}

// Parse video library
function parseVideoLibrary(content: string) {
  const entries: any[] = [];
  
  // Split by ### to get video sections
  const sections = content.split(/^### /m).filter(section => section.trim().length > 0);
  
  for (const section of sections) {
    const lines = section.trim().split('\n');
    if (lines.length === 0) continue;
    
    const title = lines[0].trim();
    if (!title || title.toLowerCase().includes('video library') || title.toLowerCase().includes('overview')) continue;
    
    console.log(`Parsing video: ${title}`);
    
    let url = '';
    let triggerMetrics: string[] = [];
    let recommendationReason = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('- **URL:**')) {
        // Extract URL from markdown link format [text](url)
        const urlMatch = trimmedLine.match(/\[.*?\]\((https:\/\/[^\)]+)\)/);
        if (urlMatch) {
          url = urlMatch[1];
        }
      } else if (trimmedLine.startsWith('- **Trigger Metrics:**')) {
        // Extract JSON array from backticks
        const metricsMatch = trimmedLine.match(/`(\[.*?\])`/);
        if (metricsMatch) {
          try {
            triggerMetrics = JSON.parse(metricsMatch[1]);
          } catch (e) {
            console.warn(`Failed to parse trigger metrics for ${title}:`, metricsMatch[1]);
          }
        }
      } else if (trimmedLine.startsWith('- **Recommendation Reason:**')) {
        recommendationReason = trimmedLine.replace('- **Recommendation Reason:**', '').trim();
      }
    }
    
    // Only include videos that have a URL
    if (!url) {
      console.warn(`Skipping video ${title} - no URL found`);
      continue;
    }
    
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
        recommendation_reason: recommendationReason,
        drills: [],
        feels: []
      }
    });
  }
  
  console.log(`Found ${entries.length} video entries`);
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

    // Use embedded markdown content instead of reading from filesystem
    console.log('Using embedded markdown content...');
    
    const markdownContent: { [key: string]: string } = {
      'knowledgeBase.md': KNOWLEDGE_BASE_CONTENT,
      'swingFaults_clean.md': SWING_FAULTS_CONTENT,
      'videoLibrary.md': VIDEO_LIBRARY_CONTENT
    };

    // Knowledge base definitions with embedded content
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