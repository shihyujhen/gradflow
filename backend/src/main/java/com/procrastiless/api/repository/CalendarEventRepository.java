package com.procrastiless.api.repository;

import com.procrastiless.api.model.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByEventDateBetweenOrderByEventDateAscStartTimeAsc(LocalDate start, LocalDate end);
    List<CalendarEvent> findByUserEmailOrderByStartDateAscStartTimeAsc(String userEmail);
    boolean existsByIdAndUserEmail(Long id, String userEmail);
    void deleteByIdAndUserEmail(Long id, String userEmail);

    @Query("""
            select event from CalendarEvent event
            where event.userEmail = :userEmail
              and coalesce(event.startDate, event.eventDate) <= :end
              and coalesce(event.endDate, coalesce(event.startDate, event.eventDate)) >= :start
            order by coalesce(event.startDate, event.eventDate) asc, event.startTime asc
            """)
    List<CalendarEvent> findOverlappingRange(@Param("userEmail") String userEmail, @Param("start") LocalDate start, @Param("end") LocalDate end);
}
