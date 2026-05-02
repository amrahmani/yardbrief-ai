import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type ReportContentBlock =
  | { type: "heading1"; text: string }
  | { type: "heading2"; text: string }
  | { type: "bullet"; text: string }
  | { type: "paragraph"; text: string };

interface ReportPdfDocumentProps {
  businessName: string;
  clientNickname: string;
  date: string;
  disclaimer: string;
  projectName: string;
  reportContent: string;
  reportType: string;
  watermarkEnabled: boolean;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFDF8",
    color: "#22332B",
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.55,
    paddingTop: 36,
    paddingBottom: 42,
    paddingHorizontal: 36,
  },
  watermark: {
    color: "#D7E3DA",
    fontSize: 40,
    left: 48,
    position: "absolute",
    top: 320,
  },
  headerCard: {
    backgroundColor: "#F3EADB",
    borderColor: "#D7D2C6",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 18,
    padding: 16,
  },
  brandRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  brandText: {
    color: "#17372C",
    fontSize: 18,
    fontWeight: 700,
  },
  brandSubtext: {
    color: "#6A706C",
    fontSize: 9,
    marginTop: 4,
  },
  businessName: {
    color: "#22332B",
    fontSize: 10,
    fontWeight: 600,
    textAlign: "right",
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metaItem: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D7D2C6",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    width: "48%",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metaLabel: {
    color: "#6A706C",
    fontSize: 8,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  metaValue: {
    color: "#22332B",
    fontSize: 10,
    fontWeight: 600,
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D7D2C6",
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
  },
  sectionTitle: {
    color: "#17372C",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  heading1: {
    color: "#17372C",
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 10,
  },
  heading2: {
    color: "#17372C",
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
    marginTop: 12,
  },
  paragraph: {
    color: "#22332B",
    fontSize: 11,
    marginBottom: 8,
  },
  bullet: {
    color: "#22332B",
    fontSize: 11,
    marginBottom: 6,
    paddingLeft: 10,
  },
  disclaimerCard: {
    backgroundColor: "#E8F4EC",
    borderColor: "#C7D9CF",
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  disclaimerTitle: {
    color: "#17372C",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  footer: {
    color: "#7B807C",
    fontSize: 9,
    marginTop: 16,
    textAlign: "center",
  },
});

function normalizeLine(line: string) {
  return line.replace(/\s+/g, " ").trim();
}

function parseMarkdownContent(markdown: string) {
  const blocks: ReportContentBlock[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) {
      return;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphBuffer.join(" "),
    });
    paragraphBuffer = [];
  };

  for (const rawLine of lines) {
    const line = normalizeLine(rawLine);

    if (!line) {
      flushParagraph();
      continue;
    }

    if (line.startsWith("# ")) {
      flushParagraph();
      blocks.push({ type: "heading1", text: line.slice(2).trim() });
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      blocks.push({ type: "heading2", text: line.slice(3).trim() });
      continue;
    }

    if (line.startsWith("- ")) {
      flushParagraph();
      blocks.push({ type: "bullet", text: line.slice(2).trim() });
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  return blocks;
}

function ContentBlock({ block }: { block: ReportContentBlock }) {
  if (block.type === "heading1") {
    return <Text style={styles.heading1}>{block.text}</Text>;
  }

  if (block.type === "heading2") {
    return <Text style={styles.heading2}>{block.text}</Text>;
  }

  if (block.type === "bullet") {
    return <Text style={styles.bullet}>- {block.text}</Text>;
  }

  return <Text style={styles.paragraph}>{block.text}</Text>;
}

export function ReportPdfDocument({
  businessName,
  clientNickname,
  date,
  disclaimer,
  projectName,
  reportContent,
  reportType,
  watermarkEnabled,
}: ReportPdfDocumentProps) {
  const blocks = parseMarkdownContent(reportContent);

  return (
    <Document author="YardBrief AI" title={`${reportType} - ${projectName}`}>
      <Page size="A4" style={styles.page} wrap>
        {watermarkEnabled ? (
          <Text fixed style={styles.watermark}>
            Generated with YardBrief AI Free
          </Text>
        ) : null}

        <View style={styles.headerCard}>
          <View style={styles.brandRow}>
            <View>
              <Text style={styles.brandText}>YardBrief AI</Text>
              <Text style={styles.brandSubtext}>by SpaceBrief</Text>
            </View>
            <Text style={styles.businessName}>{businessName}</Text>
          </View>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Project Name</Text>
              <Text style={styles.metaValue}>{projectName}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Client Nickname</Text>
              <Text style={styles.metaValue}>{clientNickname}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Report Type</Text>
              <Text style={styles.metaValue}>{reportType}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Date</Text>
              <Text style={styles.metaValue}>{date}</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>Report Content</Text>
          {blocks.map((block, index) => (
            <ContentBlock key={`${block.type}-${index}`} block={block} />
          ))}
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Disclaimer</Text>
          <Text style={styles.paragraph}>{disclaimer}</Text>
        </View>

        <Text style={styles.footer}>Generated locally in YardBrief AI.</Text>
      </Page>
    </Document>
  );
}
