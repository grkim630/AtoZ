import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CreateSessionDto } from "./dto/create-session.dto";
import { CreateSessionEventDto } from "./dto/create-session-event.dto";
import { CreateSessionMessageDto } from "./dto/create-session-message.dto";
import { EvaluateSessionDto } from "./dto/evaluate-session.dto";
import { SubmitSessionSurveyDto } from "./dto/submit-session-survey.dto";
import { SessionsService } from "./sessions.service";

@Controller("sessions")
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createSession(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateSessionDto,
  ) {
    return this.sessionsService.createSession(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/messages")
  async addMessage(
    @CurrentUser() user: { id: string },
    @Param("id") sessionId: string,
    @Body() dto: CreateSessionMessageDto,
  ) {
    return this.sessionsService.addMessage(user.id, sessionId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/events")
  async addEvent(
    @CurrentUser() user: { id: string },
    @Param("id") sessionId: string,
    @Body() dto: CreateSessionEventDto,
  ) {
    return this.sessionsService.addEvent(user.id, sessionId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/survey")
  async submitSurvey(
    @CurrentUser() user: { id: string },
    @Param("id") sessionId: string,
    @Body() dto: SubmitSessionSurveyDto,
  ) {
    return this.sessionsService.submitSurvey(user.id, sessionId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/evaluate")
  async evaluateSession(
    @CurrentUser() user: { id: string },
    @Param("id") sessionId: string,
    @Body() dto: EvaluateSessionDto,
  ) {
    return this.sessionsService.evaluateSession(user.id, sessionId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id/evaluation")
  async getEvaluation(
    @CurrentUser() user: { id: string },
    @Param("id") sessionId: string,
    @Query("jobId") jobId?: string,
  ) {
    return this.sessionsService.getEvaluation(user.id, sessionId, jobId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/finalize")
  async finalizeSession(
    @CurrentUser() user: { id: string },
    @Param("id") sessionId: string,
  ) {
    return this.sessionsService.finalizeSession(user.id, sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id/result")
  async getResult(
    @CurrentUser() user: { id: string },
    @Param("id") sessionId: string,
  ) {
    return this.sessionsService.getResult(user.id, sessionId);
  }
}
