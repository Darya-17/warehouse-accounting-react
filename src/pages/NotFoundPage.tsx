import { Container, Row, Col } from 'react-bootstrap';

const NotFoundPage = () => {
    return (
        <Container className="mt-5 text-center">
            <Row>
                <Col>
                    <h1 className="display-1">404</h1>
                    <h2>Страница не найдена</h2>
                    <p className="lead">
                        Страница, которую вы ищете, могла быть удалена, ее название могло быть изменено или она временно недоступна.
                    </p>
                    <a href="/" className="btn btn-primary">
                        На главную
                    </a>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFoundPage;