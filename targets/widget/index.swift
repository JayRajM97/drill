import WidgetKit
import SwiftUI

// MARK: - Quiet Cards palette (mirrors src/theme/tokens.ts)

extension Color {
    init(hex: UInt32) {
        self.init(
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255
        )
    }

    static let dText = Color(hex: 0x0F1115)
    static let dMuted = Color(hex: 0x6B7280)
    static let dFaint = Color(hex: 0x9CA3AF)
    static let dAccent = Color(hex: 0x1F5EFF)
    static let dAccentSoft = Color(hex: 0xE9EFFF)
}

struct Pastel { let bg: Color; let fg: Color }

func pastel(for category: String) -> Pastel {
    switch category {
    case "Product Design": return Pastel(bg: Color(hex: 0xE9EFFF), fg: Color(hex: 0x1F5EFF))
    case "Product Strategy": return Pastel(bg: Color(hex: 0xE6F6EC), fg: Color(hex: 0x15803D))
    case "Analytical": return Pastel(bg: Color(hex: 0xFFF1DB), fg: Color(hex: 0xB45309))
    case "Guesstimate": return Pastel(bg: Color(hex: 0xF1E8FF), fg: Color(hex: 0x7E22CE))
    case "AI": return Pastel(bg: Color(hex: 0xFDE7F1), fg: Color(hex: 0xBE185D))
    default: return Pastel(bg: Color(hex: 0xE0F3FB), fg: Color(hex: 0x0369A1)) // RCA
    }
}

func difficultyColor(_ d: String) -> Color {
    switch d {
    case "Easy": return Color(hex: 0x16A34A)
    case "Hard": return Color(hex: 0xDC2626)
    default: return Color(hex: 0xD97706)
    }
}

// MARK: - Timeline: a fresh question every 4 hours, deterministic per slot

struct QuestionEntry: TimelineEntry {
    let date: Date
    let question: WidgetQuestion
    let numbers: [WidgetNumber]
}

func question(at date: Date) -> WidgetQuestion {
    let cal = Calendar.current
    let day = cal.ordinality(of: .day, in: .era, for: date) ?? 0
    let slot = cal.component(.hour, from: date) / 4
    let index = (day &* 6 &+ slot) % ALL_QUESTIONS.count
    return ALL_QUESTIONS[index]
}

func numbers(at date: Date) -> [WidgetNumber] {
    let cal = Calendar.current
    let day = cal.ordinality(of: .day, in: .era, for: date) ?? 0
    let slot = cal.component(.hour, from: date) / 4
    let base = (day &* 13 &+ slot &* 5) % ALL_NUMBERS.count
    // Three distinct facts per slot, spread across the pool.
    return (0..<3).map { ALL_NUMBERS[(base &+ $0 &* 61) % ALL_NUMBERS.count] }
}

struct QuestionProvider: TimelineProvider {
    func placeholder(in context: Context) -> QuestionEntry {
        QuestionEntry(date: .now, question: ALL_QUESTIONS[0], numbers: Array(ALL_NUMBERS.prefix(3)))
    }

    func getSnapshot(in context: Context, completion: @escaping (QuestionEntry) -> Void) {
        completion(QuestionEntry(date: .now, question: question(at: .now), numbers: numbers(at: .now)))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QuestionEntry>) -> Void) {
        let cal = Calendar.current
        let now = Date()
        // Floor to the start of the current 4-hour slot.
        var comps = cal.dateComponents([.year, .month, .day, .hour], from: now)
        comps.hour = (comps.hour ?? 0) / 4 * 4
        let slotStart = cal.date(from: comps) ?? now

        // 48 hours of entries; the system re-asks when they run out.
        let entries = (0..<12).map { i -> QuestionEntry in
            let date = i == 0 ? now : cal.date(byAdding: .hour, value: i * 4, to: slotStart)!
            return QuestionEntry(date: date, question: question(at: date), numbers: numbers(at: date))
        }
        completion(Timeline(entries: entries, policy: .atEnd))
    }
}

// MARK: - Pieces

struct CategoryChip: View {
    let category: String
    var compact = false
    var onAccent = false

    var body: some View {
        let p = pastel(for: category)
        Text(category)
            .font(.system(size: compact ? 10 : 11, weight: .heavy))
            .foregroundStyle(onAccent ? Color.white : p.fg)
            .padding(.horizontal, compact ? 7 : 9)
            .padding(.vertical, compact ? 3 : 4)
            .background(onAccent ? Color.white.opacity(0.18) : p.bg)
            .clipShape(Capsule())
            .lineLimit(1)
    }
}

struct DifficultyRow: View {
    let difficulty: String
    var onAccent = false

    var body: some View {
        HStack(spacing: 4) {
            Circle()
                .fill(onAccent ? Color.white : difficultyColor(difficulty))
                .frame(width: 6, height: 6)
            Text(difficulty)
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(onAccent ? Color.white.opacity(0.75) : Color.dMuted)
        }
    }
}

struct ArrowBadge: View {
    var size: CGFloat = 26
    var inverted = false

    var body: some View {
        Image(systemName: "arrow.right")
            .font(.system(size: size * 0.45, weight: .bold))
            .foregroundStyle(inverted ? Color.dAccent : Color.white)
            .frame(width: size, height: size)
            .background(inverted ? Color.white : Color.dAccent)
            .clipShape(Circle())
    }
}

// MARK: - Widget views

struct QuestionWidgetView: View {
    var entry: QuestionEntry
    @Environment(\.widgetFamily) var family

    var body: some View {
        let q = entry.question
        let n = entry.numbers[0]
        Group {
            switch family {
            case .systemSmall:
                // A key number, app-blue with white type.
                VStack(alignment: .leading, spacing: 4) {
                    Text("DRILL")
                        .font(.system(size: 10, weight: .heavy))
                        .kerning(1.1)
                        .foregroundStyle(Color.white.opacity(0.55))
                    Spacer(minLength: 2)
                    Text(n.value)
                        .font(.system(size: 30, weight: .heavy))
                        .foregroundStyle(Color.white)
                        .lineLimit(1)
                        .minimumScaleFactor(0.55)
                    Text(n.label)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundStyle(Color.white.opacity(0.75))
                        .lineLimit(3)
                    Spacer(minLength: 2)
                    HStack(spacing: 4) {
                        Text("Do you know it?")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundStyle(Color.white.opacity(0.6))
                        Spacer()
                        Image(systemName: "arrow.right")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundStyle(Color.white.opacity(0.8))
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                .containerBackground(Color.dAccent, for: .widget)
                .widgetURL(URL(string: "drill:///numbers"))

            case .systemLarge:
                // The full question card — the blue hero from the home screen.
                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        CategoryChip(category: q.category, onAccent: true)
                        Spacer()
                        Text("DRILL")
                            .font(.system(size: 11, weight: .heavy))
                            .kerning(1.2)
                            .foregroundStyle(Color.white.opacity(0.6))
                    }
                    Spacer(minLength: 4)
                    Text(q.title)
                        .font(.system(size: 21, weight: .bold))
                        .foregroundStyle(Color.white)
                        .lineLimit(6)
                        .minimumScaleFactor(0.85)
                    Spacer(minLength: 4)
                    HStack {
                        DifficultyRow(difficulty: q.difficulty, onAccent: true)
                        Spacer()
                        HStack(spacing: 6) {
                            Text("Drill it")
                                .font(.system(size: 13, weight: .bold))
                                .foregroundStyle(Color.white.opacity(0.85))
                            ArrowBadge(size: 30, inverted: true)
                        }
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                .containerBackground(Color.dAccent, for: .widget)
                .widgetURL(URL(string: "drill:///question/\(q.id)"))

            default: // systemMedium — three key numbers with labels
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("DRILL · KEY NUMBERS")
                            .font(.system(size: 10, weight: .heavy))
                            .kerning(1.1)
                            .foregroundStyle(Color.white.opacity(0.55))
                        Spacer()
                        Image(systemName: "arrow.right")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundStyle(Color.white.opacity(0.8))
                    }
                    Spacer(minLength: 2)
                    ForEach(0..<min(3, entry.numbers.count), id: \.self) { i in
                        let item = entry.numbers[i]
                        HStack(alignment: .firstTextBaseline, spacing: 8) {
                            Text(item.value)
                                .font(.system(size: 17, weight: .heavy))
                                .foregroundStyle(Color.white)
                                .lineLimit(1)
                                .minimumScaleFactor(0.6)
                                .frame(width: 96, alignment: .leading)
                            Text(item.label)
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(Color.white.opacity(0.75))
                                .lineLimit(1)
                                .minimumScaleFactor(0.8)
                        }
                        if i < min(3, entry.numbers.count) - 1 {
                            Rectangle().fill(Color.white.opacity(0.14)).frame(height: 1)
                        }
                    }
                    Spacer(minLength: 2)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                .containerBackground(Color.dAccent, for: .widget)
                .widgetURL(URL(string: "drill:///numbers"))
            }
        }
    }
}

// MARK: - Configuration

struct DrillQuestionWidget: Widget {
    let kind = "DrillQuestionWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: QuestionProvider()) { entry in
            QuestionWidgetView(entry: entry)
        }
        .configurationDisplayName("Today's drill")
        .description("A fresh question on the big card, a key number on the small ones — every few hours.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

@main
struct DrillWidgetBundle: WidgetBundle {
    var body: some Widget {
        DrillQuestionWidget()
    }
}
