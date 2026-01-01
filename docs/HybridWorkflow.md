# FriggsGate Hybrid Workflow Design

## Vision Statement

FriggsGate is designed as a three-panel hybrid workflow system where each panel serves a distinct but interconnected purpose:

- **Left Panel**: Tool selection and structured input
- **Middle Panel**: Unstructured input/output and conversational interface
- **Right Panel**: Structured output and results display

The goal is to guide users through a coordinated experience where all panels work together at every step, creating an intuitive and efficient workflow.

## Core Workflow Principles

### 1. Panel Coordination
- Actions in one panel should trigger appropriate responses in other panels
- Users should understand at a glance which panel to interact with next
- State should be synchronized across all panels

### 2. Progressive Disclosure
- Start simple in the middle panel, escalate to structured input when needed
- Guide users naturally from unstructured to structured workflows
- Provide clear visual cues for next steps

### 4. Panel Sizing Behavior
- Panel sizes should adjust based on content requirements and workflow stage
- Left panel opens only as much as needed for current input requirements
- Right panel opens fully when displaying results, minimally for status updates
- Middle panel maintains primary focus until user moves to structured input

### 3. Context Preservation
- Maintain conversation context while switching between tools
- Allow users to reference previous outputs when starting new tools
- Enable seamless transitions between different tool workflows

## Current Tool Inventory

### Operational Tools
- PDF Preview/Download/Export
- Image Preview/Download/Export  
- Spreadsheet Preview/Download/Export

**Note**: PDF, image, and spreadsheet tools should also be available as direct options in the left panel for users who prefer to bypass conversational interaction.

### In Development (Backend Ready)
- Quick Quote
- Life Expectancy Calculator

### Future Enhancements
- Menu system for middle panel
- Additional agent-driven tools

## Specific Tool Workflows

### Quick Quote Workflow

**Trigger**: User mentions insurance quote, pricing, uses quick quote command in middle panel, OR selects Quick Quote directly from left panel

**Flow from Middle Panel**:
1. **Middle Panel**: User expresses interest in getting a quote
2. **Left Panel**: Opens substantially to accommodate Quick Quote structured form with fields:
   - Personal information
   - Coverage type selection
   - Coverage amounts
   - Deductible preferences
3. **Right Panel**: Remains closed until user submits form, then opens fully to display:
   - Quote summary
   - Coverage breakdown
   - Premium comparisons
   - Download/export options

**Flow from Left Panel Direct Access**:
1. **Left Panel**: User selects Quick Quote tool directly, form opens with adequate space
2. **Middle Panel**: Remains available for clarification or additional context
3. **Right Panel**: Opens fully after form submission with complete results

**Panel Sizing**:
- Left panel opens with sufficient room for comfortable form interaction
- Right panel stays closed during input, opens fully for results display
- Middle panel remains accessible for clarifications

### Life Expectancy Tool Workflow

**Trigger**: User asks about life expectancy, longevity planning, uses life expectancy command, OR selects Life Expectancy directly from left panel

**Flow**:
1. **Middle Panel**: User inquires about life expectancy analysis (or bypassed if starting from left panel)
2. **Left Panel**: Opens with adequate space for Life Expectancy form:
   - Demographic information
   - Health factors
   - Lifestyle inputs
   - Medical history checkboxes
3. **Right Panel**: Remains closed until form submission, then opens fully to display:
   - Life expectancy calculation
   - Risk factor analysis
   - Health recommendations
   - Actuarial charts and graphs

**Panel Sizing**:
- Left panel opens with enough room for comprehensive form interaction
- Right panel stays closed during input, opens fully for detailed results and charts
- Middle panel available for contextual questions

### PDF/Document Workflow

**Trigger**: User uploads document, requests document analysis, OR selects PDF/Image/Spreadsheet tools directly from left panel

**Flow**:
1. **Middle Panel**: Document upload or analysis request (stays mostly open)
2. **Left Panel**: Opens minimally for simple processing options:
   - Analysis type selection
   - Extract specific information
   - Formatting preferences
3. **Right Panel**: Opens almost completely (or fully) to display:
   - Document preview
   - Extracted data tables
   - Analysis results
   - Download/export options

**Panel Sizing**:
- Left panel opens only slightly since formatting preferences don't require much space
- Middle panel maintains most of its space for continued interaction
- Right panel opens almost completely to showcase document preview and download options

### General Agent Workflow

**Trigger**: Complex queries that require agent processing

**Flow**:
1. **Middle Panel**: User asks complex question or requests analysis
2. **Left Panel**: Agent selection and parameter configuration:
   - Agent type selection
   - Input parameters
   - Processing options
3. **Right Panel**: Displays:
   - Processing status
   - Agent reasoning steps
   - Final results
   - Related tool suggestions

## Menu System Design

Refer to allcapsplan.md for detailed menu system design specifications.


## Technical Considerations

### State Management
- Centralized state for cross-panel coordination
- Real-time synchronization
- Persistent session state

### Performance
- Lazy loading of panel content
- Efficient data transfer between panels
- Optimized rendering for large datasets

### Extensibility
- Plugin architecture for new tools
- Standardized tool integration APIs
- Configurable workflow templates

## Success Metrics

### User Engagement
- Panel interaction patterns
- Tool completion rates
- Session duration and depth
- User satisfaction scores

### Workflow Efficiency
- Time to complete common tasks
- Error rates in structured input
- Context preservation effectiveness
- Tool discovery and adoption

## Next Steps

1. Review and refine this workflow design
2. Create detailed wireframes for each tool workflow
3. Implement panel communication infrastructure
4. Begin with Quick Quote integration as proof of concept
5. Iterate based on user feedback and usage patterns

This hybrid workflow design ensures that FriggsGate maintains its vision of coordinated three-panel interaction while providing users with intuitive, efficient pathways to accomplish their goals.